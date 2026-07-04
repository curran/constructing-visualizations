import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Configuration ────────────────────────────────────────────────────

const TAP_URL =
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=" +
  encodeURIComponent(
    "SELECT pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,pl_orbper,st_teff,ra,dec FROM ps WHERE pl_rade IS NOT NULL ORDER BY disc_year DESC"
  ) +
  "&format=csv";

const FALLBACK_URL =
  "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&format=csv&where=pl_rade+is+not+null&order=disc_year+desc&select=pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,pl_orbper,st_teff,ra,dec";

const OUTPUT_CSV = join(__dirname, "nasa_exoplanets.csv");

// ── CSV helpers ──────────────────────────────────────────────────────

/** Parse a CSV string into an array of objects. */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j].trim()] = values[j].trim();
      }
      rows.push(row);
    }
  }
  return rows;
}

/** Parse a single CSV line, handling quoted fields. */
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
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

/** Format a row as a CSV line, quoting if needed. */
function formatCSVLine(values) {
  return values
    .map((v) => {
      const str = v == null ? "" : String(v);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    })
    .join(",");
}

// ── Classification ───────────────────────────────────────────────────

function classifyPlanet(plRade) {
  if (plRade < 1.5) return "Earth-like";
  if (plRade < 4.0) return "Neptune-like";
  return "Jupiter-like";
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching exoplanet data from NASA Exoplanet Archive...");

  let text;
  let usedFallback = false;

  // Try TAP endpoint first
  try {
    console.log("TAP endpoint:", TAP_URL.slice(0, 120) + "...");
    const response = await fetch(TAP_URL, {
      headers: { Accept: "text/csv" },
    });

    if (!response.ok) {
      throw new Error(`TAP returned HTTP ${response.status}`);
    }

    text = await response.text();
    console.log(`TAP response length: ${text.length} chars`);
  } catch (err) {
    console.warn(`TAP endpoint failed: ${err.message}`);
    console.log("Falling back to nstedAPI endpoint...");

    const response = await fetch(FALLBACK_URL, {
      headers: { Accept: "text/csv" },
    });

    if (!response.ok) {
      throw new Error(`Fallback returned HTTP ${response.status}`);
    }

    text = await response.text();
    usedFallback = true;
    console.log(`Fallback response length: ${text.length} chars`);
  }

  // Parse CSV
  console.log("Parsing CSV...");
  const rows = parseCSV(text);
  console.log(`Parsed ${rows.length} rows.`);

  if (rows.length === 0) {
    throw new Error("No data parsed from the API response.");
  }

  // Transform: derive planet_type, coerce numeric types
  const outputRows = rows.map((row) => {
    const plRade = parseFloat(row.pl_rade);
    const discYear = row.disc_year ? parseInt(row.disc_year, 10) : null;

    return {
      pl_name: row.pl_name || "",
      hostname: row.hostname || "",
      discoverymethod: row.discoverymethod || "",
      disc_year: discYear,
      pl_rade: plRade,
      pl_bmasse: row.pl_bmasse ? parseFloat(row.pl_bmasse) : null,
      pl_orbper: row.pl_orbper ? parseFloat(row.pl_orbper) : null,
      st_teff: row.st_teff ? parseFloat(row.st_teff) : null,
      ra: row.ra ? parseFloat(row.ra) : null,
      dec: row.dec ? parseFloat(row.dec) : null,
      planet_type: classifyPlanet(plRade),
    };
  });

  // Build output CSV
  const headers = [
    "pl_name",
    "hostname",
    "discoverymethod",
    "disc_year",
    "pl_rade",
    "pl_bmasse",
    "pl_orbper",
    "st_teff",
    "ra",
    "dec",
    "planet_type",
  ];

  const csvLines = [formatCSVLine(headers)];
  for (const row of outputRows) {
    csvLines.push(
      formatCSVLine(headers.map((h) => row[h]))
    );
  }

  const csvContent = csvLines.join("\n");
  writeFileSync(OUTPUT_CSV, csvContent, "utf-8");
  console.log(`Wrote ${OUTPUT_CSV}`);

  // Summary
  const fileSize = readFileSync(OUTPUT_CSV).length;
  console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Rows: ${outputRows.length}`);
  console.log(
    `Planet types: Earth-like=${outputRows.filter(
      (r) => r.planet_type === "Earth-like"
    ).length}, Neptune-like=${outputRows.filter(
      (r) => r.planet_type === "Neptune-like"
    ).length}, Jupiter-like=${outputRows.filter(
      (r) => r.planet_type === "Jupiter-like"
    ).length}`
  );
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});