// fetch-nyctlc.mjs
// Downloads NYC TLC yellow taxi trip data from S3 (Parquet), joins with zone lookup,
// aggregates by month/pickup_zone/dropoff_zone, and writes nyc_tlc_trips.csv.

import { createWriteStream } from 'node:fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import duckdb from 'duckdb';

const PARQUET_URL =
  'https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet';
const ZONE_URL =
  'https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv';
const OUT_FILE = 'nyc_tlc_trips.csv';

async function downloadCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  return res.text();
}

async function main() {
  console.log('Downloading zone lookup CSV...');
  const zoneCsv = await downloadCsv(ZONE_URL);
  // Write zone lookup to temp file for DuckDB to read
  const { writeFileSync, unlinkSync } = await import('node:fs');
  writeFileSync('/tmp/taxi_zones.csv', zoneCsv);
  const zoneRowCount = zoneCsv.trim().split('\n').length - 1;
  console.log(`  ${zoneRowCount} zones loaded`);

  console.log('Querying Parquet via DuckDB...');
  const db = new duckdb.Database(':memory:');

  // Read via httpfs extension
  await new Promise((resolve, reject) => {
    db.exec('INSTALL httpfs; LOAD httpfs;', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Run aggregation query
  const rows = await new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        DATE_PART('year', tpep_pickup_datetime) AS year,
        DATE_PART('month', tpep_pickup_datetime) AS month,
        z_pu.Zone AS pickup_zone,
        z_do.Zone AS dropoff_zone,
        COUNT(*) AS trip_count,
        ROUND(AVG(trip_distance)::numeric, 2) AS avg_trip_distance_miles,
        ROUND(AVG(total_amount)::numeric, 2) AS avg_total_amount,
        ROUND(AVG(passenger_count)::numeric, 2) AS avg_passengers,
        ROUND(SUM(total_amount)::numeric, 2) AS total_revenue,
        ROUND(
          AVG(
            EXTRACT(EPOCH FROM (tpep_dropoff_datetime - tpep_pickup_datetime)) / 60.0
          )::numeric,
          2
        ) AS avg_trip_duration_min
      FROM read_parquet('${PARQUET_URL}') t
      JOIN read_csv_auto('/tmp/taxi_zones.csv') z_pu
        ON t.PULocationID = z_pu.LocationID
      JOIN read_csv_auto('/tmp/taxi_zones.csv') z_do
        ON t.DOLocationID = z_do.LocationID
      WHERE tpep_pickup_datetime IS NOT NULL
        AND tpep_dropoff_datetime IS NOT NULL
        AND PULocationID IS NOT NULL
        AND DOLocationID IS NOT NULL
        AND trip_distance >= 0
        AND total_amount >= 0
        AND passenger_count > 0
        AND tpep_dropoff_datetime >= tpep_pickup_datetime
      GROUP BY 1, 2, 3, 4
      ORDER BY trip_count DESC
      `,
      (err, allRows) => {
        if (err) reject(err);
        else resolve(allRows);
      }
    );
  });

  db.close();

  console.log(`  ${rows.length} aggregated route-zone rows computed`);

  // Zone lookup for final mapping (already have zone names from join above)
  // Write CSV
  console.log('Writing CSV...');
  const stringifier = stringify({
    header: true,
    columns: [
      { key: 'year' },
      { key: 'month' },
      { key: 'pickup_zone' },
      { key: 'dropoff_zone' },
      { key: 'trip_count' },
      { key: 'avg_trip_distance_miles' },
      { key: 'avg_total_amount' },
      { key: 'avg_passengers' },
      { key: 'total_revenue' },
      { key: 'avg_trip_duration_min' },
    ],
  });

  const ws = createWriteStream(OUT_FILE);
  stringifier.pipe(ws);

  for (const row of rows) {
    stringifier.write(row);
  }

  stringifier.end();

  await new Promise((resolve, reject) => {
    ws.on('finish', resolve);
    ws.on('error', reject);
  });

  // Cleanup
  unlinkSync('/tmp/taxi_zones.csv');

  console.log(`Done. Wrote ${rows.length} rows to ${OUT_FILE}`);

  // Print summary
  const totalTrips = rows.reduce((s, r) => s + Number(r.trip_count), 0);
  const totalRevenue = rows.reduce((s, r) => s + Number(r.total_revenue), 0);
  const zones = new Set();
  for (const r of rows) {
    zones.add(r.pickup_zone);
    zones.add(r.dropoff_zone);
  }
  console.log(`  Total trips: ${totalTrips.toLocaleString()}`);
  console.log(`  Total revenue: $${totalRevenue.toLocaleString()}`);
  console.log(`  Unique zones: ${zones.size}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
