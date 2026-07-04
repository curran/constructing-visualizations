#!/usr/bin/env node

/**
 * fetch-storms.mjs — Download NOAA Storm Events detail CSVs (2021-2024)
 * and produce a narrowed noaa_storm_events.csv.
 *
 * No npm dependencies — uses only Node.js built-ins.
 */

import https from "node:https";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

// ── Configuration ──────────────────────────────────────────────────────────

const BASE_URL =
  "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles";

// Known exact filenames from directory listing (updated June 2026).
const YEAR_FILES = {
  2021: "StormEvents_details-ftp_v1.0_d2021_c20260323.csv.gz",
  2022: "StormEvents_details-ftp_v1.0_d2022_c20260625.csv.gz",
  2023: "StormEvents_details-ftp_v1.0_d2023_c20260323.csv.gz",
  2024: "StormEvents_details-ftp_v1.0_d2024_c20260421.csv.gz",
};

const OUTPUT = path.resolve(
  new URL(".", import.meta.url).pathname,
  "noaa_storm_events.csv",
);

// ── Helpers ────────────────────────────────────────────────────────────────

/** Minimal CSV row parser — splits on comma while respecting double-quoted fields. */
function parseCSVRow(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Escaped quote inside quoted field?  (e.g. "" → ")
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/** Parse a damage string like "1.00K", "2.50M", "0.00K", or "" into a number of dollars. */
function parseDamage(str) {
  if (!str || str.trim() === "") return 0;
  const s = str.trim().toUpperCase();
  const match = s.match(/^([0-9]+(?:\.[0-9]+)?)([KMB])?$/);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === "K") return val * 1000;
  if (suffix === "M") return val * 1000000;
  if (suffix === "B") return val * 1000000000;
  return val;
}

/** Parse an integer, returning 0 for missing/invalid. */
function parseIntOrZero(str) {
  if (!str || str.trim() === "") return 0;
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
}

/** Format a date string as YYYY-MM-DD from BEGIN_YEARMONTH and BEGIN_DAY. */
function formatDate(yearmonth, day) {
  const ym = String(yearmonth);
  const y = ym.slice(0, 4);
  const m = ym.slice(4, 6);
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Download a gzipped CSV, parse it, and return an array of narrowed row objects.
 */
async function fetchAndParseYear(year, filename) {
  const url = `${BASE_URL}/${filename}`;

  const rows = [];

  await new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `HTTP ${res.statusCode} for ${url}: ${res.statusMessage}`,
            ),
          );
          return;
        }
        const gunzip = zlib.createGunzip();
        const stream = res.pipe(gunzip);

        let headerLine = null;
        let lineBuffer = "";
        let lineCount = 0;

        stream.on("data", (chunk) => {
          lineBuffer += chunk.toString("utf-8");
          const lines = lineBuffer.split("\n");
          // Keep the last incomplete line in the buffer
          lineBuffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "") continue;
            lineCount++;

            if (headerLine === null) {
              headerLine = line;
              continue;
            }

            const fields = parseCSVRow(line);

            // We need at least 32 columns (up to TOR_F_SCALE).
            if (fields.length < 32) continue;

            const beginDate = formatDate(fields[0], fields[1]);
            const state = fields[8]; // STATE
            const czName = fields[15]; // CZ_NAME
            const eventType = fields[12]; // EVENT_TYPE
            const magnitude = parseFloat(fields[27]) || 0; // MAGNITUDE
            const magnitudeType = fields[28]; // MAGNITUDE_TYPE
            const injuries =
              parseIntOrZero(fields[20]) + parseIntOrZero(fields[21]); // INJURIES_DIRECT + INJURIES_INDIRECT
            const deaths =
              parseIntOrZero(fields[22]) + parseIntOrZero(fields[23]); // DEATHS_DIRECT + DEATHS_INDIRECT
            const propertyDamage = parseDamage(fields[24]); // DAMAGE_PROPERTY
            const cropDamage = parseDamage(fields[25]); // DAMAGE_CROPS
            const torFScale = fields[31]; // TOR_F_SCALE

            rows.push({
              begin_date: beginDate,
              state,
              cz_name: czName,
              event_type: eventType,
              magnitude,
              magnitude_type: magnitudeType,
              injuries,
              deaths,
              property_damage: propertyDamage,
              crop_damage: cropDamage,
              tor_f_scale: torFScale,
            });
          }
        });

        stream.on("end", () => {
          // Process remaining line buffer
          if (lineBuffer.trim() !== "") {
            const fields = parseCSVRow(lineBuffer);
            if (fields.length >= 32) {
              const beginDate = formatDate(fields[0], fields[1]);
              rows.push({
                begin_date: beginDate,
                state: fields[8],
                cz_name: fields[15],
                event_type: fields[12],
                magnitude: parseFloat(fields[27]) || 0,
                magnitude_type: fields[28],
                injuries:
                  parseIntOrZero(fields[20]) + parseIntOrZero(fields[21]),
                deaths:
                  parseIntOrZero(fields[22]) + parseIntOrZero(fields[23]),
                property_damage: parseDamage(fields[24]),
                crop_damage: parseDamage(fields[25]),
                tor_f_scale: fields[31],
              });
            }
          }
          resolve();
        });

        stream.on("error", (err) => reject(err));
      })
      .on("error", (err) => reject(err));
  });

  return rows;
}

/** Escape a CSV field — wrap in quotes if it contains comma, quote, or newline. */
function csvEscape(val) {
  const s = String(val);
  if (
    s.includes(",") ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Write rows as CSV to the output file. */
function writeCSV(rows, filePath) {
  const header =
    "begin_date,state,cz_name,event_type,magnitude,magnitude_type,injuries,deaths,property_damage,crop_damage,tor_f_scale";

  const lines = [header];
  for (const row of rows) {
    lines.push(
      [
        csvEscape(row.begin_date),
        csvEscape(row.state),
        csvEscape(row.cz_name),
        csvEscape(row.event_type),
        csvEscape(row.magnitude),
        csvEscape(row.magnitude_type),
        csvEscape(row.injuries),
        csvEscape(row.deaths),
        csvEscape(row.property_damage),
        csvEscape(row.crop_damage),
        csvEscape(row.tor_f_scale),
      ].join(","),
    );
  }

  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("NOAA Storm Events Downloader — 2021–2024\n");

  const allRows = [];

  for (const [year, filename] of Object.entries(YEAR_FILES)) {
    console.log(`Downloading and parsing ${year}...`);
    console.log(`  URL: ${BASE_URL}/${filename}`);
    const rows = await fetchAndParseYear(Number(year), filename);
    console.log(`  → ${rows.toLocaleString()} rows parsed`);
    allRows.push(...rows);
  }

  console.log(`\nTotal rows across all years: ${allRows.toLocaleString()}`);
  console.log(`Writing ${OUTPUT}...`);
  writeCSV(allRows, OUTPUT);

  const stats = fs.statSync(OUTPUT);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`Done! ${sizeMB} MB written (${allRows.length} rows × 11 columns).`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});