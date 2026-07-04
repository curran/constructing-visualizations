#!/usr/bin/env node

/**
 * fetch-places.mjs
 *
 * Downloads CDC PLACES county-level health data in GIS-friendly (wide) format,
 * extracts a curated set of 13 health measures, and writes cdc_places.csv.
 *
 * Source: PLACES: County Data (GIS Friendly Format), 2024 release
 *   https://data.cdc.gov/api/views/d3i6-k6z5/rows.csv?accessType=DOWNLOAD
 *
 * Schema (17 columns):
 *   location_name, state_abbr, state_desc, county_fips,
 *   obesity_pct, diabetes_pct, high_blood_pressure_pct,
 *   asthma_pct, depression_pct, checkup_pct,
 *   smoking_pct, binge_drinking_pct, no_physical_activity_pct,
 *   insufficient_sleep_pct, food_insecure_pct,
 *   housing_insecure_pct, no_health_insurance_pct
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source URL for the CDC PLACES GIS-friendly format (wide format, one row per county)
const SOURCE_URL =
  "https://data.cdc.gov/api/views/d3i6-k6z5/rows.csv?accessType=DOWNLOAD";

// Fallback URLs to try if the primary fails
const FALLBACK_URLS = [
  "https://data.cdc.gov/api/views/fu4u-a9bh/rows.csv?accessType=DOWNLOAD",
  "https://chronicdata.cdc.gov/api/views/d3i6-k6z5/rows.csv?accessType=DOWNLOAD",
];

// Mapping from source column names (CrudePrev) → output column names
const MEASURE_MAP = {
  OBESITY_CrudePrev: "obesity_pct",
  DIABETES_CrudePrev: "diabetes_pct",
  BPHIGH_CrudePrev: "high_blood_pressure_pct",
  CASTHMA_CrudePrev: "asthma_pct",
  DEPRESSION_CrudePrev: "depression_pct",
  CHECKUP_CrudePrev: "checkup_pct",
  CSMOKING_CrudePrev: "smoking_pct",
  BINGE_CrudePrev: "binge_drinking_pct",
  LPA_CrudePrev: "no_physical_activity_pct",
  SLEEP_CrudePrev: "insufficient_sleep_pct",
  FOODINSECU_CrudePrev: "food_insecure_pct",
  HOUSINSECU_CrudePrev: "housing_insecure_pct",
  ACCESS2_CrudePrev: "no_health_insurance_pct",
};

// Output columns in order
const OUTPUT_COLUMNS = [
  "location_name",
  "state_abbr",
  "state_desc",
  "county_fips",
  ...Object.values(MEASURE_MAP),
];

// Simple CSV parser that handles quoted fields
function parseCSV(text) {
  const lines = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') {
          field += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(field);
        field = "";
      } else if (ch === "\r") {
        // skip CR, handle LF next
      } else if (ch === "\n") {
        current.push(field);
        field = "";
        if (current.length > 0 && current.some((f) => f !== "")) {
          lines.push(current);
        }
        current = [];
      } else {
        field += ch;
      }
    }
  }

  // Handle last line if no trailing newline
  if (field !== "" || current.length > 0) {
    current.push(field);
    if (current.length > 0 && current.some((f) => f !== "")) {
      lines.push(current);
    }
  }

  return lines;
}

// Format a row value for CSV output
function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const str = String(value);
  // Quote if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Build CSV output string from rows
function buildCSV(rows) {
  return rows.map((row) => row.map(formatValue).join(",")).join("\n") + "\n";
}

async function fetchWithTimeout(url, timeoutMs = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function downloadCSV(url) {
  console.log(`  Downloading ${url} ...`);
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${response.statusText} for ${url}`
    );
  }
  const text = await response.text();
  console.log(`  Downloaded ${(text.length / 1024 / 1024).toFixed(1)} MB`);
  return text;
}

async function main() {
  console.log("CDC PLACES County Data Downloader\n");

  // Step 1: Download CSV
  let csvText;
  let usedUrl;
  const urlsToTry = [SOURCE_URL, ...FALLBACK_URLS];

  for (const url of urlsToTry) {
    try {
      csvText = await downloadCSV(url);
      usedUrl = url;
      break;
    } catch (err) {
      console.log(`  Failed: ${err.message}`);
    }
  }

  if (!csvText) {
    console.error("ERROR: Could not download from any URL.");
    process.exit(1);
  }

  console.log(`  Source: ${usedUrl}`);

  // Step 2: Parse CSV
  console.log("\n  Parsing CSV ...");
  const rows = parseCSV(csvText);
  console.log(`  Parsed ${rows.length - 1} data rows (${rows.length} total including header)`);

  const header = rows[0];
  const dataRows = rows.slice(1);

  // Step 3: Find column indices
  const colIndex = {};
  for (let i = 0; i < header.length; i++) {
    colIndex[header[i].trim()] = i;
  }

  console.log("\n  Columns found in source:");
  Object.keys(colIndex).forEach((name) => console.log(`    ${name}`));

  // Required source columns
  const sourceIdCols = ["CountyName", "StateAbbr", "StateDesc", "CountyFIPS"];
  for (const col of sourceIdCols) {
    if (!(col in colIndex)) {
      console.error(`ERROR: Required column "${col}" not found in source.`);
      console.error("Available columns:", Object.keys(colIndex).join(", "));
      process.exit(1);
    }
  }

  // Check which measures are available
  const availableMeasures = {};
  for (const srcCol of Object.keys(MEASURE_MAP)) {
    if (srcCol in colIndex) {
      availableMeasures[srcCol] = MEASURE_MAP[srcCol];
    } else {
      console.warn(`  WARNING: Measure column "${srcCol}" not found in source.`);
    }
  }

  console.log(
    `\n  Extracting ${Object.keys(availableMeasures).length}/${Object.keys(MEASURE_MAP).length} measures ...`
  );

  // Step 4: Build output rows
  const outputRows = [OUTPUT_COLUMNS];
  let skippedCount = 0;

  for (const row of dataRows) {
    if (row.length < header.length) {
      skippedCount++;
      continue;
    }

    const countyName = row[colIndex.CountyName]?.trim();
    const stateAbbr = row[colIndex.StateAbbr]?.trim();
    const stateDesc = row[colIndex.StateDesc]?.trim();
    const countyFips = row[colIndex.CountyFIPS]?.trim();

    // Skip rows with missing identifier data
    if (!countyName || !stateAbbr || !countyFips) {
      skippedCount++;
      continue;
    }

    const outRow = [countyName, stateAbbr, stateDesc, countyFips];

    for (const srcCol of Object.keys(availableMeasures)) {
      const val = row[colIndex[srcCol]];
      // Keep as number if present, empty string if not
      outRow.push(val !== undefined && val !== null && val !== "" ? val : "");
    }

    outputRows.push(outRow);
  }

  console.log(`  Output rows: ${outputRows.length - 1} counties`);
  if (skippedCount > 0) {
    console.log(`  Skipped ${skippedCount} rows with missing data`);
  }

  // Step 5: Write CSV
  const outputPath = path.join(__dirname, "cdc_places.csv");
  const csvOutput = buildCSV(outputRows);
  fs.writeFileSync(outputPath, csvOutput, "utf-8");
  const fileSizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log(`\n  Written: ${outputPath} (${fileSizeKb} KB, ${outputRows.length - 1} rows)`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
