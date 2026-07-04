/**
 * fetch-bts.mjs — Download BTS DB1B Market data, aggregate routes, write CSVs.
 *
 * Schema (routes.csv):
 *   origin_airport, origin_city, dest_airport, dest_city, num_tickets,
 *   total_passengers, avg_fare, weighted_avg_fare, avg_distance_miles, carrier
 *
 * Schema (airports.csv):
 *   airport_code, airport_name, city, country, latitude, longitude, altitude
 */

import { createWriteStream, existsSync, readFileSync, unlinkSync } from "fs";
import { get } from "https";
import { execSync, spawnSync } from "child_process";
import AdmZip from "adm-zip";
import { stringify } from "csv-stringify/sync";

// ── Config ──────────────────────────────────────────────────────────────
const WORKDIR = new URL(".", import.meta.url).pathname;
const AIRPORTS_DAT_URL =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";
const AIRPORTS_RAW = `${WORKDIR}airports.dat`;

// Try most recent first
const ZIP_CANDIDATES = [
  { year: "2025", quarter: "2" },
  { year: "2025", quarter: "1" },
  { year: "2024", quarter: "4" },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        safeUnlink(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        safeUnlink(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      file.close();
      safeUnlink(dest);
      reject(err);
    });
  });
}

function safeUnlink(path) {
  try { unlinkSync(path); } catch {}
}

function run(cmd) {
  console.log(`  → ${cmd}`);
  return execSync(cmd, { cwd: WORKDIR, stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
}

function escapeShellArg(arg) {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

// ── Step 1: Download airports.dat ───────────────────────────────────────
console.log("\n=== Step 1: Download airports.dat ===");
if (!existsSync(AIRPORTS_RAW)) {
  console.log("  Downloading airports.dat from OpenFlights…");
  await download(AIRPORTS_DAT_URL, AIRPORTS_RAW);
  console.log("  Done.");
} else {
  console.log("  airports.dat already exists.");
}

// ── Step 2: Download + extract BTS ZIP ──────────────────────────────────
console.log("\n=== Step 2: Download BTS DB1B Market ZIP ===");

let zipPath = null;
let csvEntryName = null;
let csvFilePath = null;

for (const { year, quarter } of ZIP_CANDIDATES) {
  const fname = `Origin_and_Destination_Survey_DB1BMarket_${year}_${quarter}.zip`;
  const path = `${WORKDIR}${fname}`;
  const url = `https://transtats.bts.gov/PREZIP/${fname}`;

  if (existsSync(path)) {
    console.log(`  Found cached ${fname}.`);
  } else {
    console.log(`  Downloading ${url} …`);
    try {
      await download(url, path);
      console.log(`  Downloaded ${fname}.`);
    } catch (err) {
      console.log(`  Failed: ${err.message}`);
      continue;
    }
  }

  // Check ZIP contents
  console.log("  Inspecting ZIP…");
  try {
    const zip = new AdmZip(path);
    const entries = zip.getEntries();
    const csvEntry = entries.find((e) => e.entryName.endsWith(".csv"));
    if (csvEntry) {
      zipPath = path;
      csvEntryName = csvEntry.entryName;
      const outCsv = csvEntryName.replace(".csv", "_extracted.csv");
      csvFilePath = `${WORKDIR}${outCsv}`;
      const sizeGb = (csvEntry.header.size / 1e9).toFixed(2);
      console.log(`  CSV: ${csvEntryName} (${sizeGb} GB) → ${outCsv}`);

      if (!existsSync(csvFilePath)) {
        console.log("  Extracting CSV with unzip…");
        // Use command-line unzip for streaming extraction (avoids loading 1.8GB into Node)
        const safeZip = escapeShellArg(path);
        const safeEntry = escapeShellArg(csvEntryName);
        run(`unzip -p ${safeZip} ${safeEntry} > ${escapeShellArg(csvFilePath)}`);
        console.log("  Extraction complete.");
      } else {
        console.log("  CSV already extracted.");
      }
      break;
    }
  } catch (err) {
    console.log(`  ZIP error: ${err.message}, trying next candidate.`);
  }
}

if (!zipPath) {
  console.error("ERROR: Could not download/extract any BTS DB1B Market ZIP.");
  process.exit(1);
}

// ── Step 3: Aggregate with DuckDB ───────────────────────────────────────
console.log("\n=== Step 3: Aggregate routes with DuckDB ===");

const routesOut = `${WORKDIR}bts_airline_routes.csv`;
const airportsOut = `${WORKDIR}bts_airports.csv`;

// Quick check
const headerLine = run(`head -1 ${escapeShellArg(csvFilePath)}`);
console.log(`  Header: ${headerLine.substring(0, 150)}`);
const totalLines = run(`wc -l < ${escapeShellArg(csvFilePath)}`);
console.log(`  Total rows (incl. header): ${totalLines.trim()}`);

// DuckDB query — aggregates by Origin, Dest, RPCarrier
const duckSql = `
COPY (
  SELECT
    Origin AS origin_airport,
    '' AS origin_city,
    Dest AS dest_airport,
    '' AS dest_city,
    CAST(COUNT(*) AS INTEGER) AS num_tickets,
    CAST(SUM(Passengers) AS BIGINT) AS total_passengers,
    ROUND(AVG(MktFare)::NUMERIC, 2)::FLOAT AS avg_fare,
    ROUND((SUM(MktFare * Passengers) / NULLIF(SUM(Passengers), 0))::NUMERIC, 2)::FLOAT AS weighted_avg_fare,
    ROUND(AVG(MktDistance)::NUMERIC, 2)::FLOAT AS avg_distance_miles,
    RPCarrier AS carrier
  FROM read_csv_auto(${escapeShellArg(csvFilePath)},
    header=true, delim=',', quote='"', columns={'ItinID': 'VARCHAR', 'MktID': 'VARCHAR', 'MktCoupons': 'INTEGER', 'Year': 'INTEGER', 'Quarter': 'INTEGER', 'OriginAirportID': 'VARCHAR', 'OriginAirportSeqID': 'VARCHAR', 'OriginCityMarketID': 'VARCHAR', 'Origin': 'VARCHAR', 'OriginCountry': 'VARCHAR', 'OriginStateFips': 'VARCHAR', 'OriginState': 'VARCHAR', 'OriginStateName': 'VARCHAR', 'OriginWac': 'VARCHAR', 'DestAirportID': 'VARCHAR', 'DestAirportSeqID': 'VARCHAR', 'DestCityMarketID': 'VARCHAR', 'Dest': 'VARCHAR', 'DestCountry': 'VARCHAR', 'DestStateFips': 'VARCHAR', 'DestState': 'VARCHAR', 'DestStateName': 'VARCHAR', 'DestWac': 'VARCHAR', 'AirportGroup': 'VARCHAR', 'WacGroup': 'VARCHAR', 'TkCarrierChange': 'VARCHAR', 'TkCarrierGroup': 'VARCHAR', 'OpCarrierChange': 'VARCHAR', 'OpCarrierGroup': 'VARCHAR', 'RPCarrier': 'VARCHAR', 'TkCarrier': 'VARCHAR', 'OpCarrier': 'VARCHAR', 'BulkFare': 'VARCHAR', 'Passengers': 'FLOAT', 'MktFare': 'FLOAT', 'MktDistance': 'FLOAT', 'MktDistanceGroup': 'VARCHAR', 'MktMilesFlown': 'VARCHAR', 'NonStopMiles': 'VARCHAR', 'ItinGeoType': 'VARCHAR', 'MktGeoType': 'VARCHAR'})
  WHERE Passengers > 0 AND MktFare > 0 AND Origin != '' AND Dest != ''
  GROUP BY Origin, Dest, RPCarrier
  ORDER BY total_passengers DESC
) TO ${escapeShellArg(routesOut)} (HEADER, DELIMITER ',');
`;

console.log("  Running DuckDB aggregation (this may take a few minutes)…");
try {
  run(`duckdb -c ${JSON.stringify(duckSql)}`);
  console.log("  DuckDB aggregation complete.");
} catch (err) {
  console.error("  DuckDB error:", err.message);
  process.exit(1);
}

// ── Step 4: Build airport lookup and enrich city names ──────────────────
console.log("\n=== Step 4: Enrich routes with city names ===");

// Parse OpenFlights airports.dat
// schema: id, name, city, country, iata, icao, lat, lon, alt, tz, dst, tz_db, type, source
const airportMap = {};
const raw = readFileSync(AIRPORTS_RAW, "utf-8").split("\n");
for (const line of raw) {
  const t = line.trim();
  if (!t) continue;
  // Parse CSV with possible quoted fields
  const parts = [];
  let cur = "";
  let inQuote = false;
  for (const ch of t) {
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === "," && !inQuote) { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  parts.push(cur);
  if (parts.length < 9) continue;
  const iata = (parts[4] || "").trim();
  if (iata && iata.length === 3) {
    airportMap[iata] = {
      name: parts[1],
      city: parts[2],
      country: parts[3],
      lat: parseFloat(parts[6]) || 0,
      lon: parseFloat(parts[7]) || 0,
      alt: parseFloat(parts[8]) || 0,
    };
  }
}
console.log(`  Loaded ${Object.keys(airportMap).length} airports from OpenFlights.`);

// Read DuckDB output and enrich
const rawRoutes = readFileSync(routesOut, "utf-8").trim().split("\n");
if (rawRoutes.length < 2) {
  console.error("ERROR: No routes data.");
  process.exit(1);
}
const routeHeader = rawRoutes[0];
const routeRows = rawRoutes.slice(1);
console.log(`  ${routeRows.length} route rows from DuckDB.`);

// Simple line parser for our output format
function parseDuckRow(line) {
  const cols = line.split(",");
  return {
    origin_airport: cols[0],
    origin_city: cols[1],
    dest_airport: cols[2],
    dest_city: cols[3],
    num_tickets: parseInt(cols[4], 10) || 0,
    total_passengers: parseInt(cols[5], 10) || 0,
    avg_fare: parseFloat(cols[6]) || 0,
    weighted_avg_fare: parseFloat(cols[7]) || 0,
    avg_distance_miles: parseFloat(cols[8]) || 0,
    carrier: cols[9] || "",
  };
}

function formatCity(info) {
  if (!info || !info.city) return "";
  const country = info.country;
  if (country === "United States") {
    // For US airports, OpenFlights doesn't have state info in the city field
    // Just return "City, USA" for now — we don't have state codes in the airports.dat
    return `${info.city}, USA`;
  }
  return `${info.city}, ${country}`;
}

const enriched = routeRows.map((line) => {
  const r = parseDuckRow(line);
  const oInfo = airportMap[r.origin_airport];
  const dInfo = airportMap[r.dest_airport];
  return {
    origin_airport: r.origin_airport,
    origin_city: formatCity(oInfo),
    dest_airport: r.dest_airport,
    dest_city: formatCity(dInfo),
    num_tickets: r.num_tickets,
    total_passengers: r.total_passengers,
    avg_fare: r.avg_fare,
    weighted_avg_fare: r.weighted_avg_fare,
    avg_distance_miles: r.avg_distance_miles,
    carrier: r.carrier,
  };
});

// Write enriched routes
const routesCsv = stringify(enriched, { header: true });
createWriteStream(routesOut).end(routesCsv);
console.log(`  Wrote ${enriched.length} route records.`);

// ── Step 5: Write airports CSV ──────────────────────────────────────────
console.log("\n=== Step 5: Write airports.csv ===");

const codes = new Set();
for (const r of enriched) {
  if (r.origin_airport) codes.add(r.origin_airport);
  if (r.dest_airport) codes.add(r.dest_airport);
}
console.log(`  ${codes.size} unique airport codes in routes.`);

const airportRows = [];
for (const code of codes) {
  const info = airportMap[code];
  if (info) {
    airportRows.push({
      airport_code: code,
      airport_name: info.name,
      city: info.city,
      country: info.country === "United States" ? "USA" : info.country,
      latitude: info.lat,
      longitude: info.lon,
      altitude: info.alt,
    });
  } else {
    airportRows.push({
      airport_code: code,
      airport_name: "",
      city: "",
      country: "",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    });
  }
}

const airportsCsv = stringify(airportRows, { header: true });
createWriteStream(airportsOut).end(airportsCsv);
console.log(`  Wrote ${airportRows.length} airport records.`);

// ── Step 6: Cleanup ─────────────────────────────────────────────────────
console.log("\n=== Step 6: Cleanup ===");
if (csvFilePath && existsSync(csvFilePath)) {
  safeUnlink(csvFilePath);
  console.log("  Removed extracted CSV.");
}
if (existsSync(AIRPORTS_RAW)) {
  safeUnlink(AIRPORTS_RAW);
  console.log("  Removed airports.dat.");
}

// ── Summary ─────────────────────────────────────────────────────────────
console.log("\n=== Done ===");
const rLines = run(`wc -l < ${escapeShellArg(routesOut)}`);
const aLines = run(`wc -l < ${escapeShellArg(airportsOut)}`);
console.log(`  ${routesOut} — ${rLines.trim()} lines`);
console.log(`  ${airportsOut} — ${aLines.trim()} lines`);
console.log(`  Routes size: ${run(`ls -lh ${escapeShellArg(routesOut)} | awk '{print $5}'`)}`);
console.log(`  Airports size: ${run(`ls -lh ${escapeShellArg(airportsOut)} | awk '{print $5}'`)}`);
console.log(`  Routes header: ${run(`head -1 ${escapeShellArg(routesOut)}`)}`);
console.log(`  Airports header: ${run(`head -1 ${escapeShellArg(airportsOut)}`)}`);
console.log(`  Sample: ${run(`sed -n '2p' ${escapeShellArg(routesOut)}`)}`);