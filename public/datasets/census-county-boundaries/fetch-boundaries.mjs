import { readFileSync, writeFileSync, createWriteStream } from "fs";
import { unlink } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import { stringify } from "csv-stringify/sync";
import { get } from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));

const GAZETTEER_URL =
  "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip";

const OUTPUT_CSV = join(__dirname, "county_boundaries.csv");

// ── Helpers ──────────────────────────────────────────────────────────

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve());
      });
    }).on("error", (err) => {
      file.close(() => reject(err));
    });
  });
}

function parseGazetteerLine(line) {
  // Gazetteer format: tab-delimited, trailing whitespace on last column
  // Columns: USPS, GEOID, ANSICODE, NAME, ALAND, AWATER, ALAND_SQMI, AWATER_SQMI, INTPTLAT, INTPTLONG
  const parts = line.trim().split("\t");
  if (parts.length < 10) return null;

  const geoid = parts[1].trim();
  const stateFips = geoid.slice(0, 2);
  const stateAbbr = parts[0].trim();

  return {
    GEOID: geoid,
    name: parts[3].trim(),
    state_fips: stateFips,
    state_abbr: stateAbbr,
    aland: parseInt(parts[4].trim(), 10) || 0,
    awater: parseInt(parts[5].trim(), 10) || 0,
    centroid_lat: parseFloat(parts[8].trim()) || 0,
    centroid_lng: parseFloat(parts[9].trim()) || 0,
  };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Downloading Gazetteer zip...");
  const zipPath = join(__dirname, "gazetteer.zip");
  await downloadFile(GAZETTEER_URL, zipPath);

  console.log("Extracting...");
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  // Find the text file
  const txtEntry = zipEntries.find((e) => e.name.endsWith(".txt"));
  if (!txtEntry) {
    throw new Error("No text file found in Gazetteer zip");
  }

  const content = txtEntry.getData().toString("utf-8");
  const lines = content.trim().split(/\r?\n/);

  // First line is the header, skip it
  const dataLines = lines.slice(1);

  const records = [];
  for (const line of dataLines) {
    const rec = parseGazetteerLine(line);
    if (rec) {
      records.push(rec);
    } else {
      console.warn(`Skipped unparseable line: "${line.slice(0, 80)}..."`);
    }
  }

  console.log(`Parsed ${records.length} county records.`);

  const csv = stringify(records, { header: true });
  writeFileSync(OUTPUT_CSV, csv, "utf-8");
  console.log(`Wrote ${OUTPUT_CSV}`);

  // Clean up zip
  await unlink(zipPath);

  // Summary
  const fileSize = readFileSync(OUTPUT_CSV).length;
  console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});