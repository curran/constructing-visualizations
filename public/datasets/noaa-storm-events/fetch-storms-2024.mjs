#!/usr/bin/env node

/**
 * fetch-storms-2024.mjs — Download ONLY the 2024 NOAA Storm Events
 * and produce a smaller noaa_storm_events_2024.csv.
 *
 * Adapted from fetch-storms.mjs (no npm dependencies).
 */

import https from "node:https";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

// ── Configuration ──────────────────────────────────────────────────────────

const BASE_URL =
  "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles";

const FILE_2024 = "StormEvents_details-ftp_v1.0_d2024_c20260421.csv.gz";

const OUTPUT = path.resolve(
  new URL(".", import.meta.url).pathname,
  "noaa_storm_events_2024.csv",
);

// ── Helpers (identical to fetch-storms.mjs) ────────────────────────────────

function parseCSVRow(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
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

function parseIntOrZero(str) {
  if (!str || str.trim() === "") return 0;
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
}

function formatDate(yearmonth, day) {
  const ym = String(yearmonth);
  const y = ym.slice(0, 4);
  const m = ym.slice(4, 6);
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function fetchAndParseYear(filename) {
  const url = `${BASE_URL}/${filename}`;
  const rows = [];

  await new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const gunzip = zlib.createGunzip();
        const stream = res.pipe(gunzip);

        let headerLine = null;
        let lineBuffer = "";

        stream.on("data", (chunk) => {
          lineBuffer += chunk.toString("utf-8");
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "") continue;
            if (headerLine === null) { headerLine = line; continue; }

            const fields = parseCSVRow(line);
            if (fields.length < 32) continue;

            rows.push({
              begin_date: formatDate(fields[0], fields[1]),
              state: fields[8],
              cz_name: fields[15],
              event_type: fields[12],
              magnitude: parseFloat(fields[27]) || 0,
              magnitude_type: fields[28],
              injuries: parseIntOrZero(fields[20]) + parseIntOrZero(fields[21]),
              deaths: parseIntOrZero(fields[22]) + parseIntOrZero(fields[23]),
              property_damage: parseDamage(fields[24]),
              crop_damage: parseDamage(fields[25]),
              tor_f_scale: fields[31],
            });
          }
        });

        stream.on("end", () => {
          if (lineBuffer.trim() !== "") {
            const fields = parseCSVRow(lineBuffer);
            if (fields.length >= 32) {
              rows.push({
                begin_date: formatDate(fields[0], fields[1]),
                state: fields[8],
                cz_name: fields[15],
                event_type: fields[12],
                magnitude: parseFloat(fields[27]) || 0,
                magnitude_type: fields[28],
                injuries: parseIntOrZero(fields[20]) + parseIntOrZero(fields[21]),
                deaths: parseIntOrZero(fields[22]) + parseIntOrZero(fields[23]),
                property_damage: parseDamage(fields[24]),
                crop_damage: parseDamage(fields[25]),
                tor_f_scale: fields[31],
              });
            }
          }
          resolve();
        });
        stream.on("error", reject);
      })
      .on("error", reject);
  });

  return rows;
}

function csvEscape(val) {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r"))
    return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function writeCSV(rows, filePath) {
  const header = "begin_date,state,cz_name,event_type,magnitude,magnitude_type,injuries,deaths,property_damage,crop_damage,tor_f_scale";
  const lines = [header];
  for (const row of rows) {
    lines.push([
      csvEscape(row.begin_date), csvEscape(row.state), csvEscape(row.cz_name),
      csvEscape(row.event_type), csvEscape(row.magnitude), csvEscape(row.magnitude_type),
      csvEscape(row.injuries), csvEscape(row.deaths),
      csvEscape(row.property_damage), csvEscape(row.crop_damage), csvEscape(row.tor_f_scale),
    ].join(","));
  }
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("NOAA Storm Events Downloader — 2024 only\n");
  console.log(`URL: ${BASE_URL}/${FILE_2024}`);

  const rows = await fetchAndParseYear(FILE_2024);
  console.log(`→ ${rows.toLocaleString()} rows parsed`);

  console.log(`Writing ${OUTPUT}...`);
  writeCSV(rows, OUTPUT);

  const stats = fs.statSync(OUTPUT);
  console.log(`Done! ${(stats.size / (1024 * 1024)).toFixed(2)} MB written (${rows.length} rows × 11 columns).`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});