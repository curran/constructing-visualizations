import { execSync } from "child_process";
import { writeFileSync, statSync, existsSync, readFileSync } from "fs";

const DATA_DIR = new URL(".", import.meta.url).pathname;
const INPUT_CSV = `${DATA_DIR}Origin_and_Destination_Survey_DB1BMarket_2025_2_extracted.csv`;
const OUTPUT_CSV = `${DATA_DIR}bts_airline_routes.csv`;
const AIRPORTS_OUT = `${DATA_DIR}bts_airports.csv`;

// Pipe SQL via stdin to duckdb
const SQL = `
COPY (
  SELECT
    Origin AS origin_airport,
    Dest AS dest_airport,
    CAST(COUNT(*) AS INTEGER) AS num_tickets,
    CAST(SUM(CAST(Passengers AS BIGINT)) AS BIGINT) AS total_passengers,
    ROUND(AVG(CAST(MktFare AS DOUBLE)), 2) AS avg_fare,
    ROUND((SUM(CAST(MktFare AS DOUBLE) * CAST(Passengers AS DOUBLE)) / NULLIF(SUM(CAST(Passengers AS DOUBLE)), 0)), 2) AS weighted_avg_fare,
    ROUND(AVG(CAST(MktDistance AS DOUBLE)), 2) AS avg_distance_miles,
    RPCarrier AS carrier
  FROM read_csv_auto('${INPUT_CSV}', header=true, delim=',', quote='"')
  WHERE CAST(Passengers AS DOUBLE) > 0 AND CAST(MktFare AS DOUBLE) > 0 AND Origin != '' AND Dest != ''
  GROUP BY Origin, Dest, RPCarrier
  ORDER BY total_passengers DESC
) TO '${OUTPUT_CSV}' (HEADER, DELIMITER ',');
`.trim();

console.log("Running DuckDB aggregation via stdin...");
try {
  const result = execSync(`duckdb -c "${SQL.replace(/"/g, '\\"')}"`, {
    cwd: DATA_DIR,
    timeout: 600000,
    stdio: "pipe",
    shell: true,
  });
  console.log("stdout:", result.stdout?.toString().trim());
  console.log("stderr:", result.stderr?.toString().trim());
} catch (e) {
  // Fallback: write SQL to file and use stdin pipe
  console.log("Trying stdin pipe approach...");
  writeFileSync(`${DATA_DIR}query.sql`, SQL, "utf-8");
  try {
    const result = execSync(`duckdb < ${DATA_DIR}query.sql`, {
      cwd: DATA_DIR,
      timeout: 600000,
      stdio: "pipe",
      shell: true,
    });
    console.log("stdout:", result.stdout?.toString().trim());
    console.log("stderr:", result.stderr?.toString().trim());
  } catch (e2) {
    // Try without the database argument - use :memory:
    try {
      const result = execSync(`cat ${DATA_DIR}query.sql | duckdb :memory:`, {
        cwd: DATA_DIR,
        timeout: 600000,
        stdio: "pipe",
        shell: true,
      });
      console.log("stdout:", result.stdout?.toString().trim());
      console.log("stderr:", result.stderr?.toString().trim());
    } catch (e3) {
      console.error("All DuckDB approaches failed.");
      console.error("Error 1:", e.message);
      console.error("Error 2:", e2?.message);
      console.error("Error 3:", e3?.message);
      process.exit(1);
    }
  }
}

// Verify output
if (existsSync(OUTPUT_CSV)) {
  const stats = statSync(OUTPUT_CSV);
  console.log(`\nRoutes CSV: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  const { execSync: exec } = await import("child_process");
  const wc = exec(`wc -l "${OUTPUT_CSV}"`).toString().trim();
  console.log(`Rows: ${wc}`);
} else {
  console.error("ERROR: Output CSV not created!");
  process.exit(1);
}

// Also write the airports file
console.log("\nProcessing airports data...");
if (existsSync(`${DATA_DIR}airports.dat`)) {
  const text = readFileSync(`${DATA_DIR}airports.dat`, "utf-8");
  const lines = text.split("\n").filter(Boolean);
  const airports = [];
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length >= 8) {
      const iata = parts[4]?.replace(/"/g, "").trim();
      if (iata && iata.length === 3) {
        airports.push({
          airport_code: iata,
          airport_name: parts[1]?.replace(/"/g, "").trim() || "",
          city: parts[2]?.replace(/"/g, "").trim() || "",
          country: parts[3]?.replace(/"/g, "").trim() || "",
          latitude: parseFloat(parts[6]) || 0,
          longitude: parseFloat(parts[7]) || 0,
          altitude: parseInt(parts[8]) || 0,
        });
      }
    }
  }
  
  if (airports.length > 0) {
    const header = "airport_code,airport_name,city,country,latitude,longitude,altitude";
    const rows = airports.map(a => 
      `${a.airport_code},"${a.airport_name}","${a.city}","${a.country}",${a.latitude},${a.longitude},${a.altitude}`
    );
    writeFileSync(AIRPORTS_OUT, [header, ...rows].join("\n"), "utf-8");
    console.log(`Airports CSV: ${airports.length} airports`);
  }
}

console.log("\n=== Done ===");