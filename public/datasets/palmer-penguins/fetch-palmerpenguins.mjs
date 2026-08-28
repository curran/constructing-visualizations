#!/usr/bin/env node

/**
 * fetch-palmerpenguins.mjs
 *
 * Downloads the Palmer Penguins dataset from the canonical source:
 * the `palmerpenguins` R package by Allison Horst, available on GitHub
 * (https://github.com/allisonhorst/palmerpenguins), hosted on CRAN and
 * mirrored via Zenodo (DOI: 10.5281/zenodo.3960218).
 *
 * The tidy `penguins.csv` file (344 rows x 8 columns) is the primary
 * dataset used in visualization examples as an alternative to iris.
 *
 * Processing: the canonical file is already clean, so this script saves it
 * byte-for-byte after validating structure and reports summary stats.
 *
 * Columns: species, island, bill_length_mm, bill_depth_mm,
 *          flipper_length_mm, body_mass_g, sex, year
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Configuration ────────────────────────────────────────────────────

const SOURCE_URL =
  "https://raw.githubusercontent.com/allisonhorst/palmerpenguins/main/inst/extdata/penguins.csv";

const FALLBACK_URL =
  "https://raw.githubusercontent.com/allisonhorst/palmerpenguins/master/inst/extdata/penguins.csv";

const OUTPUT_CSV = join(__dirname, "penguins.csv");

const EXPECTED_COLUMNS = 8;
const EXPECTED_HEADER =
  "species,island,bill_length_mm,bill_depth_mm,flipper_length_mm,body_mass_g,sex,year";

// ── CSV helpers (lightweight, no dependencies) ───────────────────────

/** Parse a single CSV line, handling quoted fields. */
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

/** Validate a CSV body: header match + consistent column count per row. */
function validateCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error("Empty CSV.");

  const header = lines[0].trim();
  if (header !== EXPECTED_HEADER) {
    throw new Error(`Unexpected header: "${header}"`);
  }

  const rows = lines.slice(1);
  rows.forEach((line, i) => {
    const cols = parseCSVLine(line).length;
    if (cols !== EXPECTED_COLUMNS) {
      throw new Error(
        `Row ${i + 2} has ${cols} columns (expected ${EXPECTED_COLUMNS}).`
      );
    }
  });

  return { rows };
}

// ── Stats ────────────────────────────────────────────────────────────

function summarize(rows) {
  const data = rows.map((line) => parseCSVLine(line));
  const count = (idx) =>
    data.reduce((m, r) => ((m[r[idx]] = (m[r[idx]] || 0) + 1), m), {});
  return {
    species: count(0),
    island: count(1),
    sex: count(6),
    missing: data.filter((r) => r[2] === "NA").length,
  };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching Palmer Penguins dataset from GitHub...");

  let text;
  let usedFallback = false;

  try {
    console.log("Source URL:", SOURCE_URL);
    const response = await fetch(SOURCE_URL, {
      headers: { Accept: "text/csv" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    text = await response.text();
  } catch (err) {
    console.warn(`Primary source failed: ${err.message}`);
    console.log("Falling back to master branch URL...");
    const response = await fetch(FALLBACK_URL);
    if (!response.ok) throw new Error(`Fallback returned HTTP ${response.status}`);
    text = await response.text();
    usedFallback = true;
  }

  console.log(`Downloaded ${text.length} chars.`);

  // Validate structure
  console.log("Validating CSV structure...");
  const { rows } = validateCSV(text);
  console.log(`Validated: ${rows.length} data rows x ${EXPECTED_COLUMNS} columns.`);

  if (rows.length === 0) {
    throw new Error("No data rows found.");
  }

  // Preserve the canonical file byte-for-byte
  writeFileSync(OUTPUT_CSV, text, "utf-8");
  console.log(`Wrote ${OUTPUT_CSV}`);

  // Summary
  const fileSize = readFileSync(OUTPUT_CSV).length;
  const stats = summarize(rows);
  console.log(`File size: ${(fileSize / 1024).toFixed(1)} KB`);
  console.log(`Rows: ${rows.length}`);
  console.log(`Species: ${JSON.stringify(stats.species)}`);
  console.log(`Islands: ${JSON.stringify(stats.island)}`);
  console.log(`Sex: ${JSON.stringify(stats.sex)}`);
  console.log(`Rows with missing measurements (NA): ${stats.missing}`);
  if (usedFallback) console.log("Note: used fallback source.");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});