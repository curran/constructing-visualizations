#!/usr/bin/env node

/**
 * fetch-laus.mjs
 *
 * Downloads BLS LAUS (Local Area Unemployment Statistics) county data
 * from the BLS FTP server and aggregates monthly values into annual
 * averages, producing bls_laus_county.csv.
 *
 * Data files (tab-separated):
 *   la.data.0.CurrentU90-94 (1990-1994)
 *   la.data.0.CurrentU95-99 (1995-1999)
 *   la.data.0.CurrentU00-04 (2000-2004)
 *   la.data.0.CurrentU05-09 (2005-2009)
 *   la.data.0.CurrentU10-14 (2010-2014)
 *   la.data.0.CurrentU15-19 (2015-2019)
 *   la.data.0.CurrentU20-24 (2020-2024)
 *   la.data.0.CurrentU25-29 (2025-2029)
 *
 * Reference files:
 *   la.area   – area definitions (maps area code → county name + state)
 *   la.series – series definitions (maps series_id → area_code + measure_code)
 *
 * Series ID format for counties: LAUCN + 5-digit FIPS + "0000000" + 3-digit measure
 *   Measure 03 = unemployment rate (%)
 *   Measure 04 = unemployed (count, in thousands)
 *   Measure 05 = employment (count, in thousands)
 *   Measure 06 = labor force (count, in thousands)
 */

import { writeFileSync } from "node:fs";
import { stringify } from "csv-stringify/sync";

const BASE_URL = "https://download.bls.gov/pub/time.series/la";

// Data files covering different year ranges
const DATA_FILES = [
  "la.data.0.CurrentU90-94", // 1990-1994
  "la.data.0.CurrentU95-99", // 1995-1999
  "la.data.0.CurrentU00-04", // 2000-2004
  "la.data.0.CurrentU05-09", // 2005-2009
  "la.data.0.CurrentU10-14", // 2010-2014
  "la.data.0.CurrentU15-19", // 2015-2019
  "la.data.0.CurrentU20-24", // 2020-2024
  "la.data.0.CurrentU25-29", // 2025-2029
];

// Reference files
const AREA_FILE = "la.area";
const SERIES_FILE = "la.series";

// Measure codes to include
const MEASURE_CODES = ["03", "04", "05", "06"];
const MEASURE_NAMES = {
  "03": "unemployment_rate",
  "04": "unemployment",
  "05": "employment",
  "06": "labor_force",
};

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";

/**
 * Download a file from the BLS FTP server.
 * Uses global fetch() (Node 18+) which handles gzip automatically.
 * Returns the body as a string.
 */
async function download(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}: ${response.statusText}`);
  }
  return await response.text();
}

/**
 * Parse a tab-separated text body, returning an array of header names
 * and an array of row objects.
 */
function parseTSV(body) {
  const lines = body.trimEnd().split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headerLine = lines[0].trimEnd();
  const headers = headerLine.split("\t");

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (!line) continue;
    const values = line.split("\t");
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || "").trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Parse a series_id to extract area_type, FIPS code, and measure code.
 * County series: LAUCN + FIPS(5) + zeros(7) + measure(3)
 */
function parseSeriesId(seriesId) {
  if (!seriesId || seriesId.length < 20) return null;
  const prefix = seriesId.substring(0, 5); // LAUCN, LASBS, etc.
  const fipsArea = seriesId.substring(5, 18); // area code portion
  const measureCode = seriesId.substring(17, 20); // last 3 chars

  // Extract FIPS from the area code: CN0100100000000 -> 01001
  // The area code in the series_id starts after the prefix ('LAUCN')
  // But the area_code in la.area is like 'CN0100100000000'
  // The FIPS is characters 2-6 of the area_code (after 'CN')
  // In the series_id, after 'LAUCN' comes what? Let me look:
  // LAUCN010010000000003
  //  012345678901234567890
  // LAUCN = prefix (5)
  // 01001 = FIPS (5)
  // 0000000 = zeros (7)
  // 003 = measure (3)
  // So FIPS = chars 5-9 of series_id
  const fips = seriesId.substring(5, 10);

  return {
    prefix,
    fips,
    areaCodeRaw: seriesId.substring(5, 17), // FIPS + zeros (12 chars)
    measureCode,
  };
}

async function main() {
  console.log("Downloading reference files...");

  // Download area definitions
  console.log(`  Fetching ${AREA_FILE}...`);
  const areaBody = await download(`${BASE_URL}/${AREA_FILE}`);
  const { rows: areaRows } = parseTSV(areaBody);
  console.log(`  → ${areaRows.length} area definitions loaded`);

  // Build lookup: area_code -> { name, state_abbr }
  // County area codes are like 'CN0100100000000'
  // area_text is like 'Autauga County, AL'
  const areaLookup = {};
  for (const row of areaRows) {
    const areaCode = row.area_code;
    const areaText = row.area_text;
    if (areaCode && areaText) {
      // Extract state abbreviation from end: ", AL"
      const match = areaText.match(/,\s*([A-Z]{2})$/);
      const stateAbbr = match ? match[1] : "";
      // Extract county name: everything before ", ST"
      const nameMatch = areaText.match(/^(.+?),\s*[A-Z]{2}$/);
      const name = nameMatch ? nameMatch[1] : areaText;
      areaLookup[areaCode] = { name, stateAbbr };
    }
  }

  // Download series definitions (to know which series are county level)
  console.log(`  Fetching ${SERIES_FILE}...`);
  const seriesBody = await download(`${BASE_URL}/${SERIES_FILE}`);
  const { rows: seriesRows } = parseTSV(seriesBody);
  console.log(`  → ${seriesRows.length} series definitions loaded`);

  // Build a set of county series IDs
  const countySeriesSet = new Set();
  const seriesMeasureMap = {}; // series_id -> measure_code
  const seriesAreaMap = {}; // series_id -> area_code

  for (const row of seriesRows) {
    const seriesId = row.series_id;
    if (!seriesId) continue;

    // Check if series starts with LAUCN (county-level)
    if (!seriesId.startsWith("LAUCN")) continue;

    const measureCode = row.measure_code;
    if (!MEASURE_CODES.includes(measureCode)) continue;

    countySeriesSet.add(seriesId);
    seriesMeasureMap[seriesId] = measureCode;
    seriesAreaMap[seriesId] = row.area_code;
  }

  console.log(
    `  → ${countySeriesSet.size} county series in scope (measures 03/04/05/06)`
  );

  // Download and parse all data files
  const allDataRows = [];
  for (const dataFile of DATA_FILES) {
    console.log(`  Fetching ${dataFile}...`);
    const dataBody = await download(`${BASE_URL}/${dataFile}`);
    const { rows: dataRows } = parseTSV(dataBody);
    console.log(`  → ${dataRows.length} rows loaded`);

    // Filter to county series and keep only monthly values (M01-M12)
    for (const row of dataRows) {
      const seriesId = row.series_id;
      if (!countySeriesSet.has(seriesId)) continue;

      const period = row.period;
      // Skip annual averages (M13), keep monthly only
      if (!period || period === "M13") continue;

      const value = parseFloat(row.value);
      if (isNaN(value)) continue;

      const year = parseInt(row.year, 10);
      if (isNaN(year)) continue;

      allDataRows.push({
        seriesId,
        year,
        month: parseInt(period.substring(1), 10), // M01 -> 1
        value,
        measureCode: seriesMeasureMap[seriesId],
        areaCode: seriesAreaMap[seriesId],
      });
    }
  }

  console.log(`\nTotal monthly county data points: ${allDataRows.length}`);

  // Deduplicate: if we have overlapping year ranges, take the first occurrence
  // (earlier files are more authoritative for their time range)
  const deduped = [];
  const seen = new Set();
  for (const row of allDataRows) {
    const key = `${row.seriesId}|${row.year}|${row.month}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  console.log(`After deduplication: ${deduped.length} rows`);

  // Aggregate monthly to annual by averaging
  // Group by (seriesId, year, measureCode)
  const annualGroups = {};
  for (const row of deduped) {
    const key = `${row.seriesId}|${row.year}`;
    if (!annualGroups[key]) {
      annualGroups[key] = {
        seriesId: row.seriesId,
        year: row.year,
        measureCode: row.measureCode,
        areaCode: row.areaCode,
        values: [],
      };
    }
    annualGroups[key].values.push(row.value);
  }

  // Compute annual averages
  const annualRows = Object.values(annualGroups);
  console.log(`Annual groups: ${annualRows.length}`);

  // Now pivot: group by (fips, year) and create one row per county-year
  // with all 4 measures
  const countyYearMap = {};

  for (const group of annualRows) {
    const parsed = parseSeriesId(group.seriesId);
    if (!parsed) continue;

    const fips = parsed.fips;
    const year = group.year;
    const measureCode = group.measureCode;
    const areaCode = group.areaCode;

    // Compute annual average (mean of monthly values)
    const annualValue =
      group.values.reduce((sum, v) => sum + v, 0) / group.values.length;

    const key = `${fips}|${year}`;
    if (!countyYearMap[key]) {
      // Look up county name and state from area code
      const areaInfo = areaLookup[areaCode] || {};
      countyYearMap[key] = {
        geoid: fips,
        county_name: areaInfo.name || "",
        state_abbr: areaInfo.stateAbbr || "",
        year,
        labor_force: null,
        employment: null,
        unemployment: null,
        unemployment_rate: null,
      };
    }

    const measureName = MEASURE_NAMES[measureCode];
    if (measureName) {
      // Round to 1 decimal place
      countyYearMap[key][measureName] = Math.round(annualValue * 10) / 10;
    }
  }

  const resultRows = Object.values(countyYearMap);

  // Filter out rows missing required data (must have at least one measure)
  const validRows = resultRows.filter(
    (r) =>
      r.labor_force !== null ||
      r.employment !== null ||
      r.unemployment !== null ||
      r.unemployment_rate !== null
  );

  // Sort by geoid then year
  validRows.sort((a, b) => {
    if (a.geoid !== b.geoid) return a.geoid.localeCompare(b.geoid);
    return a.year - b.year;
  });

  console.log(`\nValid county-year rows: ${validRows.length}`);
  console.log(
    `Date range: ${Math.min(...validRows.map((r) => r.year))} - ${Math.max(...validRows.map((r) => r.year))}`
  );
  console.log(
    `Unique counties: ${new Set(validRows.map((r) => r.geoid)).size}`
  );

  // Write CSV
  const columns = [
    "geoid",
    "county_name",
    "state_abbr",
    "year",
    "labor_force",
    "employment",
    "unemployment",
    "unemployment_rate",
  ];

  const csvOutput = stringify(validRows, {
    header: true,
    columns,
  });

  const outputPath = "bls_laus_county.csv";
  writeFileSync(outputPath, csvOutput, "utf8");

  // Count lines
  const lineCount = csvOutput.trimEnd().split("\n").length;
  const fileSizeKB = (Buffer.byteLength(csvOutput, "utf8") / 1024).toFixed(1);

  console.log(`\n✅ Written ${outputPath}`);
  console.log(`   Rows (data): ${validRows.length}`);
  console.log(`   Lines (incl. header): ${lineCount}`);
  console.log(`   File size: ${fileSizeKB} KB`);
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});