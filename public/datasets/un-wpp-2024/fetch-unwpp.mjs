import { createWriteStream, createReadStream, writeFileSync, statSync } from "fs";
import { readFile, unlink } from "fs/promises";
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify/sync";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Column mapping: UN CSV column name -> our column name
const COLUMN_MAP = {
  ISO3_code: "iso_code",
  Location: "location",
  Region: "region",
  SubRegion: "subregion",
  Time: "year",
  PopTotal: "total_population",
  PopMale: "pop_male",
  PopFemale: "pop_female",
  MedianAge: "median_age",
  CBR: "birth_rate",
  CDR: "death_rate",
  LEx: "life_expectancy",
  TFR: "fertility_rate",
  UrbanPct: "urban_pct",
};

const OUR_COLUMNS = Object.values(COLUMN_MAP);
const YEAR_START = 1950;
const YEAR_END = 2024;

// Source URLs in priority order
const URLS = [
  "https://population.un.org/wpp/Download/Files/1_Indicators%20(Standard)/CSV/WPP2024_General_2024.csv",
  "https://population.un.org/wpp/Download/Files/1_Indicators%20(Standard)/CSV/WPP2024_General_2024.csv.gz",
  "https://data.worldpop.org/UN_WPP2024/WPP2024_General_2024.csv",
  "https://github.com/owid/owid-datasets/raw/master/datasets/UN%20World%20Population%20Prospects%20(2024)/UN%20World%20Population%20Prospects%20(2024).csv",
];

const TMP_CSV = join(__dirname, "_raw.csv");
const TMP_GZ = join(__dirname, "_raw.csv.gz");
const OUTPUT_CSV = join(__dirname, "un_wpp_2024.csv");

/**
 * Try to download from each URL in order. Returns the raw CSV text.
 */
async function downloadCsv() {
  for (const url of URLS) {
    console.log(`Trying: ${url}`);
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30000),
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!response.ok) {
        console.log(`  -> HTTP ${response.status}, skipping`);
        continue;
      }

      if (url.endsWith(".gz")) {
        console.log("  -> Downloading gzipped...");
        const buffer = Buffer.from(await response.arrayBuffer());
        await writeFile(TMP_GZ, buffer);
        console.log("  -> Decompressing...");
        const source = createReadStream(TMP_GZ);
        const dest = createWriteStream(TMP_CSV);
        await pipeline(source, createGunzip(), dest);
        const csvText = await readFile(TMP_CSV, "utf-8");
        await unlink(TMP_GZ).catch(() => {});
        await unlink(TMP_CSV).catch(() => {});
        console.log(`  -> Downloaded and decompressed (${buffer.length} bytes raw)`);
        return csvText;
      } else {
        console.log("  -> Downloading...");
        const csvText = await response.text();
        console.log(`  -> Downloaded (${(csvText.length / 1024 / 1024).toFixed(1)} MB)`);
        return csvText;
      }
    } catch (err) {
      console.log(`  -> Error: ${err.message}, trying next...`);
    }
  }
  throw new Error("All download URLs failed");
}

/**
 * Parse the raw UN CSV and filter to only our columns and year range.
 */
function parseAndFilter(rawCsvText) {
  return new Promise((resolve, reject) => {
    const results = [];
    let headerRow = null;
    const columnIndices = {};

    const parser = parse({ bom: true, relax_column_count: true });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        if (!headerRow) {
          headerRow = record;
          // Map UN column names to indices
          for (const unCol of Object.keys(COLUMN_MAP)) {
            const idx = headerRow.indexOf(unCol);
            if (idx !== -1) {
              columnIndices[unCol] = idx;
            } else {
              console.warn(`  Warning: Column "${unCol}" not found in header`);
            }
          }
          // Check we have the essential columns
          const required = ["ISO3_code", "Location", "Time", "PopTotal"];
          for (const col of required) {
            if (!(col in columnIndices)) {
              console.warn(`  Warning: Required column "${col}" not found in header`);
            }
          }
          return;
        }

        const rawYear = record[columnIndices["Time"]]?.trim();
        const year = parseInt(rawYear, 10);
        if (isNaN(year) || year < YEAR_START || year > YEAR_END) {
          return;
        }

        const row = {};
        for (const [unCol, ourCol] of Object.entries(COLUMN_MAP)) {
          const idx = columnIndices[unCol];
          if (idx !== undefined && idx < record.length) {
            let val = record[idx]?.trim() || "";
            if (ourCol === "year") {
              row[ourCol] = year;
            } else if (
              [
                "total_population", "pop_male", "pop_female",
                "birth_rate", "death_rate", "life_expectancy",
                "fertility_rate", "urban_pct", "median_age",
              ].includes(ourCol)
            ) {
              const num = parseFloat(val);
              row[ourCol] = isNaN(num) ? "" : num;
            } else {
              row[ourCol] = val;
            }
          } else {
            row[ourCol] = "";
          }
        }
        results.push(row);
      }
    });

    parser.on("error", (err) => reject(err));
    parser.on("end", () => resolve(results));

    parser.write(rawCsvText);
    parser.end();
  });
}

async function main() {
  console.log("=== UN WPP 2024 Dataset Downloader ===\n");

  // 1. Download
  console.log("Step 1: Downloading...");
  const rawCsv = await downloadCsv();

  // 2. Parse and filter
  console.log("\nStep 2: Parsing and filtering...");
  const rows = await parseAndFilter(rawCsv);
  console.log(`  Filtered to ${rows.length} rows (${YEAR_START}-${YEAR_END})`);

  // 3. Count unique locations
  const locations = new Set(rows.map((r) => r.iso_code).filter(Boolean));
  const totalPop = rows.reduce((s, r) => s + (r.total_population || 0), 0);
  const populationBillions = (totalPop / 1000).toFixed(1); // thousands -> actual
  console.log(`  ${locations.size} unique locations`);
  console.log(`  Total population across all rows: ${populationBillions}B`);

  // 4. Write output CSV
  console.log("\nStep 3: Writing CSV...");
  const csvContent = stringify(rows, { header: true, columns: OUR_COLUMNS });
  writeFileSync(OUTPUT_CSV, csvContent, "utf-8");
  const stats = statSync(OUTPUT_CSV);
  console.log(`  Wrote: ${OUTPUT_CSV}`);
  console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Rows: ${rows.length}`);
  console.log(`  Locations: ${locations.size}`);

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
