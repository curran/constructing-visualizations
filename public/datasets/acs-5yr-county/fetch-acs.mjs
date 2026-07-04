#!/usr/bin/env node

/**
 * fetch-acs.mjs
 *
 * Fetches ACS 5-Year County Data (2019-2023) from Census Bureau sources:
 *   - Gazetteer file for county names, state, land area
 *   - Summary file .dat files for demographic/economic/housing data
 *
 * Uses streaming to avoid memory issues with large files.
 *
 * Output: acs_5yr_county.csv (16 columns, ~3200 rows)
 */

import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { get } from "https";
import { join } from "path";
import { createInterface } from "readline";
import AdmZip from "adm-zip";
import { stringify } from "csv-stringify/sync";

// -------------------------------------------------------------------
// Config
// -------------------------------------------------------------------
const WORK_DIR = new URL(".", import.meta.url).pathname;
const CACHE_DIR = join(WORK_DIR, ".cache");
const OUTPUT = join(WORK_DIR, "acs_5yr_county.csv");

const GAZETTEER_URL =
  "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip";

const DAT_URL_BASE =
  "https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/";

// USPS to full state name mapping
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia", PR: "Puerto Rico",
};

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (existsSync(dest)) {
      resolve();
      return;
    }
    const file = createWriteStream(dest);
    console.log(`  Downloading ${url} ...`);
    get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      try { file.close(); } catch (_) {}
      reject(err);
    });
  });
}

function safeNum(v) {
  if (v === undefined || v === null || v === "" || v === "-555555555" || v === "-666666666") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function safePct(numerator, denominator) {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/**
 * Stream through a .dat file line by line using readline,
 * filter to county rows (GEO_ID starts with "0500000US"),
 * and call rowCallback(geoid, valuesByColumnName) for each county row.
 */
function streamDatFile(filePath, neededCols) {
  return new Promise((resolve, reject) => {
    const results = {};
    const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
    let headers = [];
    let lineNum = 0;

    rl.on("line", (line) => {
      if (lineNum === 0) {
        // Header row
        headers = line.trim().split("|");
        lineNum++;
        return;
      }
      lineNum++;
      const vals = line.split("|");
      if (vals.length < 2) return;
      const geoId = vals[0];
      if (!geoId.startsWith("0500000US")) return;
      const geoid = geoId.replace("0500000US", "");
      if (geoid.length !== 5) return;

      const row = {};
      for (const col of neededCols) {
        const idx = headers.indexOf(col);
        row[col] = idx >= 0 && idx < vals.length ? safeNum(vals[idx].trim()) : null;
      }
      results[geoid] = row;
    });

    rl.on("close", () => resolve(results));
    rl.on("error", reject);
  });
}

// -------------------------------------------------------------------
// Main
// -------------------------------------------------------------------
async function main() {
  console.log("ACS 5-Year County Data Generator");
  console.log("=================================\n");

  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  // ---------------------------------------------------------------
  // Step 1: Download and parse Gazetteer
  // ---------------------------------------------------------------
  console.log("Step 1: Downloading Gazetteer file...");
  const gazZipPath = join(CACHE_DIR, "2023_Gaz_counties_national.zip");
  await download(GAZETTEER_URL, gazZipPath);

  console.log("  Extracting...");
  const zip = new AdmZip(gazZipPath);
  const gazEntry = zip.getEntries().find((e) => e.entryName.endsWith(".txt"));
  if (!gazEntry) throw new Error("No .txt file found in Gazetteer zip");
  const gazText = gazEntry.getData().toString("utf8");
  const gazLines = gazText.trim().split("\n");
  const gazHeadersArr = gazLines[0].split("\t").map((h) => h.trim());
  const gazRows = {};

  for (let i = 1; i < gazLines.length; i++) {
    const vals = gazLines[i].split("\t").map((v) => v.trim());
    if (vals.length < 5) continue;
    const geoid = vals[gazHeadersArr.indexOf("GEOID")];
    const name = vals[gazHeadersArr.indexOf("NAME")];
    const usps = vals[gazHeadersArr.indexOf("USPS")];
    const alandSqMi = safeNum(vals[gazHeadersArr.indexOf("ALAND_SQMI")]);
    const stateName = STATE_NAMES[usps] || usps;
    gazRows[geoid] = { geoid, name, state: stateName, land_area: alandSqMi };
  }
  console.log(`  Parsed ${Object.keys(gazRows).length} counties from Gazetteer.`);

  // ---------------------------------------------------------------
  // Step 2: Download ACS summary .dat files and stream-extract data
  // ---------------------------------------------------------------
  console.log("\nStep 2: Downloading and processing ACS summary data files...");

  const datFiles = [
    { file: "acsdt5y2023-b01001.dat", cols: ["B01001_E001"], label: "total_population" },
    { file: "acsdt5y2023-b01002.dat", cols: ["B01002_E001"], label: "median_age" },
    { file: "acsdt5y2023-b03002.dat", cols: ["B03002_E001", "B03002_E003", "B03002_E004", "B03002_E006", "B03002_E012"], label: "race_ethnicity" },
    { file: "acsdt5y2023-b15003.dat", cols: ["B15003_E001", "B15003_E022", "B15003_E023", "B15003_E024", "B15003_E025"], label: "education" },
    { file: "acsdt5y2023-b19013.dat", cols: ["B19013_E001"], label: "income" },
    { file: "acsdt5y2023-b17001.dat", cols: ["B17001_E001", "B17001_E002"], label: "poverty" },
    { file: "acsdt5y2023-b25003.dat", cols: ["B25003_E001", "B25003_E002"], label: "tenure" },
    { file: "acsdt5y2023-b25064.dat", cols: ["B25064_E001"], label: "rent" },
    { file: "acsdt5y2023-b25001.dat", cols: ["B25001_E001"], label: "housing_units" },
  ];

  // Store all data in a flat map: countyData[geoid][colName] = value
  const countyData = {};
  for (const geoid of Object.keys(gazRows)) {
    countyData[geoid] = {};
  }

  for (const { file, cols } of datFiles) {
    const url = DAT_URL_BASE + file;
    const cachePath = join(CACHE_DIR, file);
    console.log(`  Processing ${file}...`);
    await download(url, cachePath);

    const rows = await streamDatFile(cachePath, cols);
    let count = 0;
    for (const [geoid, row] of Object.entries(rows)) {
      if (!countyData[geoid]) continue;
      for (const col of cols) {
        countyData[geoid][col] = row[col];
      }
      count++;
    }
    console.log(`    ${count} county rows indexed.`);
  }

  // ---------------------------------------------------------------
  // Step 3: Build records and write CSV
  // ---------------------------------------------------------------
  console.log("\nStep 3: Building records and writing CSV...");

  const records = [];
  for (const [geoid, gaz] of Object.entries(gazRows)) {
    const d = countyData[geoid] || {};

    const total_population = d["B01001_E001"] ?? null;
    const median_age = d["B01002_E001"] ?? null;

    const total_race = d["B03002_E001"] ?? null;
    const white = d["B03002_E003"] ?? null;
    const black = d["B03002_E004"] ?? null;
    const asian = d["B03002_E006"] ?? null;
    const hispanic = d["B03002_E012"] ?? null;

    const pct_white = safePct(white, total_race);
    const pct_black = safePct(black, total_race);
    const pct_asian = safePct(asian, total_race);
    const pct_hispanic = safePct(hispanic, total_race);

    const pop25plus = d["B15003_E001"] ?? null;
    const bachelors = d["B15003_E022"] ?? null;
    const masters = d["B15003_E023"] ?? null;
    const professional = d["B15003_E024"] ?? null;
    const doctorate = d["B15003_E025"] ?? null;
    const higherEd = [bachelors, masters, professional, doctorate].some((v) => v !== null)
      ? (bachelors ?? 0) + (masters ?? 0) + (professional ?? 0) + (doctorate ?? 0)
      : null;
    const pct_bachelors_or_higher = safePct(higherEd, pop25plus);

    const median_household_income = d["B19013_E001"] ?? null;

    const poverty_total = d["B17001_E001"] ?? null;
    const poverty_below = d["B17001_E002"] ?? null;
    const pct_below_poverty = safePct(poverty_below, poverty_total);

    const housing_total = d["B25003_E001"] ?? null;
    const owner_occ = d["B25003_E002"] ?? null;
    const pct_owner_occupied = safePct(owner_occ, housing_total);

    const median_rent = d["B25064_E001"] ?? null;
    const total_housing_units = d["B25001_E001"] ?? null;

    records.push({
      GEOID: geoid,
      name: gaz.name,
      state: gaz.state,
      total_population,
      median_age,
      pct_white,
      pct_black,
      pct_hispanic,
      pct_asian,
      pct_bachelors_or_higher,
      median_household_income,
      pct_below_poverty,
      pct_owner_occupied,
      median_rent,
      total_housing_units,
      land_area: gaz.land_area,
    });
  }

  const columns = [
    "GEOID",
    "name",
    "state",
    "total_population",
    "median_age",
    "pct_white",
    "pct_black",
    "pct_hispanic",
    "pct_asian",
    "pct_bachelors_or_higher",
    "median_household_income",
    "pct_below_poverty",
    "pct_owner_occupied",
    "median_rent",
    "total_housing_units",
    "land_area",
  ];

  const csv = stringify(records, { header: true, columns });
  writeFileSync(OUTPUT, csv);

  const fileSizeMB = (Buffer.byteLength(csv) / (1024 * 1024)).toFixed(2);
  const statesCount = new Set(records.map((r) => r.state)).size;

  console.log(`\n=== Summary ===`);
  console.log(`  Written: ${OUTPUT}`);
  console.log(`  Rows: ${records.length}`);
  console.log(`  Size: ${fileSizeMB} MB`);
  console.log(`  States/Territories: ${statesCount}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});