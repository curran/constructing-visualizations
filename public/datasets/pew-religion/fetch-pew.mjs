#!/usr/bin/env node

import { stringify } from "csv-stringify/sync";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import countries from "i18n-iso-countries";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = join(__dirname, "pew_religion.csv");

// --- URLs for the source data ---
// These are Pew Research Center's own hosted dataset ZIP and raw CSVs.
const URLS = [
  // The primary source: Pew's hosted ZIP file (contains 4 CSV files + README + XLSX)
  "https://www.pewresearch.org/wp-content/uploads/sites/20/2025/06/Religious-Composition-2010-2020-dataset.zip",
  // Fallback URLs from the original 2015 report
  "https://www.pewresearch.org/religion/wp-content/uploads/sites/7/2015/04/global-religion-tables.csv",
  "https://raw.githubusercontent.com/pewresearch/global-religion/main/data/global-religion.csv",
  "https://github.com/pewresearch/religion/raw/main/data/global-religion.csv",
];

// --- Religion category labels (maps source column name → display name) ---
const RELIGION_MAP = {
  Christians: "Christianity",
  Muslims: "Islam",
  Religiously_unaffiliated: "Unaffiliated",
  Buddhists: "Buddhism",
  Hindus: "Hinduism",
  Jews: "Judaism",
  Other_religions: "Other Religions",
};

const RELIGION_KEYS = Object.keys(RELIGION_MAP);

// --- CSV parsing (handles quoted fields, CRLF) ---
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
          i++;
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
        // skip CR
      } else if (ch === "\n") {
        current.push(field);
        field = "";
        if (current.length > 0 && current.some((f) => f.trim() !== "")) {
          lines.push(current);
        }
        current = [];
      } else {
        field += ch;
      }
    }
  }

  // Handle last line
  if (field.trim() !== "" || current.length > 0) {
    current.push(field);
    if (current.some((f) => f.trim() !== "")) {
      lines.push(current);
    }
  }

  return lines;
}

function findColumnIndex(headers, name) {
  const idx = headers.indexOf(name);
  if (idx === -1) throw new Error(`Column "${name}" not found in source`);
  return idx;
}

function parsePewCSV(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) {
    throw new Error("CSV has fewer than 2 rows (header + 1 data)");
  }
  const headers = rows[0].map((h) => h.trim());
  return { headers, rows: rows.slice(1) };
}

// --- Download helpers ---
async function download(url) {
  console.log(`Trying URL: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength < 100) {
    throw new Error(`Response too short (${buffer.byteLength} bytes)`);
  }
  console.log(`  Downloaded ${(buffer.byteLength / 1024).toFixed(1)} KB`);
  return buffer;
}

async function downloadZipAndExtractCSVs(url) {
  const buffer = await download(url);
  // Write zip to temp and extract using Node.js zlib
  const { tmpdir } = await import("os");
  const { mkdtempSync } = await import("fs");
  const { execSync } = await import("child_process");

  const tmpDir = mkdtempSync(join(tmpdir(), "pew-"));
  const zipPath = join(tmpDir, "data.zip");
  writeFileSync(zipPath, Buffer.from(buffer));

  console.log(`  Extracting ZIP to ${tmpDir}...`);
  execSync(`unzip -o "${zipPath}" -d "${tmpDir}"`, { stdio: "pipe" });

  // Find CSV files in the extracted directory
  const { readdirSync, existsSync } = await import("fs");
  const items = readdirSync(tmpDir);
  const dir = items.find((i) =>
    existsSync(join(tmpDir, i)) &&
    // Check if it's a directory
    readdirSync(join(tmpDir, i)) &&
    readdirSync(join(tmpDir, i)).some((f) => f.endsWith(".csv"))
  );

  let csvDir = tmpDir;
  if (dir) {
    csvDir = join(tmpDir, dir);
  }

  const files = readdirSync(csvDir).filter((f) => f.endsWith(".csv"));

  const csvTexts = {};
  for (const file of files) {
    const name = file.toLowerCase();
    if (name.includes("percentage")) {
      csvTexts.percentages = readFileSync(join(csvDir, file), "utf8");
    } else if (name.includes("diversity")) {
      csvTexts.diversity = readFileSync(join(csvDir, file), "utf8");
    } else if (name.includes("rounded") && !name.includes("unrounded")) {
      csvTexts.rounded = readFileSync(join(csvDir, file), "utf8");
    } else if (name.includes("unrounded")) {
      csvTexts.unrounded = readFileSync(join(csvDir, file), "utf8");
    }
  }

  console.log(`  Found CSVs: ${Object.keys(csvTexts).join(", ")}`);

  // Clean up temp
  execSync(`rm -rf "${tmpDir}"`, { stdio: "pipe" });

  return csvTexts;
}

// --- Main ---
async function main() {
  let percentagesText = null;
  let diversityText = null;

  // Try URLs in order
  for (const url of URLS) {
    try {
      if (url.endsWith(".zip")) {
        const csvTexts = await downloadZipAndExtractCSVs(url);
        percentagesText = csvTexts.percentages;
        diversityText = csvTexts.diversity;
      } else {
        const text = await download(url).then((b) =>
          new TextDecoder("utf-8").decode(b)
        );
        percentagesText = text;
      }
      console.log(`  Success.`);
      break;
    } catch (err) {
      console.log(`  Failed: ${err.message}`);
    }
  }

  if (!percentagesText) {
    console.error("All URLs failed. Exiting.");
    process.exit(1);
  }

  // Parse percentages CSV
  console.log("\nParsing percentages CSV...");
  const pct = parsePewCSV(percentagesText);
  const pH = pct.headers;
  const pRows = pct.rows;

  const iCountry = findColumnIndex(pH, "Country");
  const iRegion = findColumnIndex(pH, "Region");
  const iYear = findColumnIndex(pH, "Year");
  const iPop = findColumnIndex(pH, "Population");
  const iLevel = findColumnIndex(pH, "Level");
  const iCode = findColumnIndex(pH, "Countrycode");

  // Validate religion columns exist
  for (const key of RELIGION_KEYS) {
    if (!pH.includes(key)) {
      throw new Error(`Religion column "${key}" not found in percentages CSV`);
    }
  }

  // Parse diversity CSV (if available)
  let diversityData = {};
  if (diversityText) {
    console.log("Parsing diversity statistics CSV...");
    const div = parsePewCSV(diversityText);
    const dH = div.headers;
    const dRows = div.rows;

    const dCountry = findColumnIndex(dH, "Country");
    const dYear = findColumnIndex(dH, "Year");
    const dScore = findColumnIndex(dH, "RDI_score");
    const dLevel = findColumnIndex(dH, "Level");

    for (const row of dRows) {
      const level = parseInt(row[dLevel]);
      if (level !== 1) continue; // Only individual countries
      const country = row[dCountry]?.trim();
      const year = parseInt(row[dYear]);
      const score = parseFloat(row[dScore]);
      if (country && !isNaN(score)) {
        if (!diversityData[country]) diversityData[country] = {};
        diversityData[country][year] = score;
      }
    }
    console.log(`  Loaded diversity data for ${Object.keys(diversityData).length} countries`);
  }

  // Group percentage rows by country
  const countryData = {};

  for (const row of pRows) {
    const level = parseInt(row[iLevel]);
    if (level !== 1) continue; // Only individual countries, not regions/totals

    const country = row[iCountry]?.trim();
    const region = row[iRegion]?.trim();
    const year = parseInt(row[iYear]);
    const code = parseInt(row[iCode]);

    if (!country || country === "" || country.startsWith("All ")) continue;

    if (!countryData[country]) {
      countryData[country] = { iso3: null, region, code, years: {} };
    }
    countryData[country].years[year] = {
      population: parseFloat(row[iPop]) || 0,
      religionValues: {},
    };

    // Parse each religion's percentage
    for (const key of RELIGION_KEYS) {
      const idx = findColumnIndex(pH, key);
      const val = parseFloat(row[idx]);
      countryData[country].years[year].religionValues[key] =
        !isNaN(val) ? val : 0;
    }
  }

  console.log(`  Found ${Object.keys(countryData).length} individual countries`);

  // Custom ISO3 overrides for special cases
  const CUSTOM_ISO3 = {
    Kosovo: "XKX",
    "Channel Islands": "---",  // No single ISO3; combined data for Jersey & Guernsey
  };

  // Map numeric codes to ISO3 codes
  for (const [country, data] of Object.entries(countryData)) {
    // Check custom mapping first
    if (CUSTOM_ISO3[country]) {
      data.iso3 = CUSTOM_ISO3[country];
      continue;
    }

    let iso3 = null;
    try {
      iso3 = countries.numericToAlpha3(data.code.toString());
    } catch (e) {
      // Try to look up by country name
      try {
        const alpha2 = countries.getAlpha2Code(country, "en");
        if (alpha2) {
          iso3 = countries.alpha2ToAlpha3(alpha2);
        }
      } catch (e2) {
        // ignore
      }
    }
    data.iso3 = iso3 || "";
  }

  // Build output rows
  const outRows = [];

  for (const [country, data] of Object.entries(countryData)) {
    const y2010 = data.years[2010];
    const y2020 = data.years[2020];

    if (!y2010 && !y2020) continue;

    // Use whichever year's data is available (prefer 2020)
    const pop2010 = y2010 ? Math.round(y2010.population) : 0;
    const pop2020 = y2020 ? Math.round(y2020.population) : 0;

    // Diversity index from 2020 (fallback to 2010)
    let diversityIndex = "";
    if (diversityData[country] && diversityData[country][2020] !== undefined) {
      diversityIndex = diversityData[country][2020];
    } else if (diversityData[country] && diversityData[country][2010] !== undefined) {
      diversityIndex = diversityData[country][2010];
    }

    for (const key of RELIGION_KEYS) {
      const pct2010 = y2010 ? y2010.religionValues[key] : 0;
      const pct2020 = y2020 ? y2020.religionValues[key] : 0;

      // Skip if both percentages are 0 (no adherents in either year)
      if (pct2010 === 0 && pct2020 === 0) continue;

      outRows.push({
        country,
        iso3: data.iso3,
        region: data.region,
        year: 2020,
        religion: RELIGION_MAP[key],
        pct_2010: parseFloat(pct2010.toFixed(1)),
        pct_2020: parseFloat(pct2020.toFixed(1)),
        population_2010: pop2010,
        population_2020: pop2020,
        diversity_index:
          diversityIndex !== ""
            ? parseFloat(parseFloat(diversityIndex).toFixed(2))
            : "",
      });
    }
  }

  console.log(`  Transformed rows: ${outRows.length}`);

  // Sort by country name, then religion
  outRows.sort((a, b) => {
    if (a.country < b.country) return -1;
    if (a.country > b.country) return 1;
    if (a.religion < b.religion) return -1;
    if (a.religion > b.religion) return 1;
    return 0;
  });

  // Write output CSV
  const csvString = stringify(outRows, {
    header: true,
    columns: [
      "country",
      "iso3",
      "region",
      "year",
      "religion",
      "pct_2010",
      "pct_2020",
      "population_2010",
      "population_2020",
      "diversity_index",
    ],
  });

  writeFileSync(OUTPUT_FILE, csvString);
  console.log(`\nWrote ${OUTPUT_FILE}`);
  console.log(`  Size: ${(csvString.length / 1024).toFixed(1)} KB`);

  // Quick validation
  const lines = csvString.trim().split("\n");
  console.log(`  Header + ${lines.length - 1} data rows`);
  console.log(`  Sample (line 2): ${lines[1]}`);
  console.log(`  Sample (line 3): ${lines[2]}`);

  // Validate a few known values
  const indiaRows = outRows.filter((r) => r.country === "India");
  const indiaHindu = indiaRows.find((r) => r.religion === "Hinduism");
  if (indiaHindu) {
    console.log(
      `\n  Validation: India Hinduism: pct_2010=${indiaHindu.pct_2010}% (~79.8%), pct_2020=${indiaHindu.pct_2020}% (~79.4%)`
    );
  }
}

// Re-import for the zip extraction
import { readFileSync } from "fs";

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});