# NYC TLC Trip Record Data

**Yellow taxi trip records from New York City, aggregated by zone pairs per month (January 2024).**

A processed sample of NYC TLC yellow taxi trip data. Raw Parquet files are
aggregated using DuckDB to produce a manageable dataset of route-level
summaries by pickup/dropoff zone, including trip counts, distances, fares,
passengers, and durations.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `nyc_tlc_trips.csv` | ~1.6 MB | ~24,000 rows × 10 columns |

---

## Schema (10 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `year` | number | Year | `2024` |
| 2 | `month` | number | Month (1-12) | `1` |
| 3 | `pickup_zone` | string | Pickup taxi zone name | `Upper East Side South` |
| 4 | `dropoff_zone` | string | Dropoff taxi zone name | `Upper East Side North` |
| 5 | `trip_count` | number | Number of trips | `21073` |
| 6 | `avg_trip_distance_miles` | number | Average trip distance (mi) | `1.06` |
| 7 | `avg_total_amount` | number | Average fare + tip + tolls ($) | `15.74` |
| 8 | `avg_passengers` | number | Average passenger count | `1.33` |
| 9 | `total_revenue` | number | Total collected revenue ($) | `331697.77` |
| 10 | `avg_trip_duration_min` | number | Average trip duration (min) | `7.84` |

---

## Pipeline

### Source Data

| Source | Format | URL |
|---|---|---|
| Yellow taxi trip records (Jan 2024) | Parquet | `https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet` |
| Taxi Zone Lookup | CSV | `https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv` |

### Processing

1. **Download** the taxi zone lookup CSV from S3.
2. **Query** the yellow taxi Parquet file from S3 using DuckDB's `httpfs` extension.
3. **Aggregate** by month, pickup zone, dropoff zone — computing trip counts, averages, and totals.
4. **Filter** invalid rows (negative distances/fares, zero passengers, future dropoffs before pickups).
5. **Export** result as `nyc_tlc_trips.csv`.

### SQL Query

```sql
SELECT
  DATE_PART('year', tpep_pickup_datetime) AS year,
  DATE_PART('month', tpep_pickup_datetime) AS month,
  z_pu.Zone AS pickup_zone,
  z_do.Zone AS dropoff_zone,
  COUNT(*) AS trip_count,
  ROUND(AVG(trip_distance), 2) AS avg_trip_distance_miles,
  ROUND(AVG(total_amount), 2) AS avg_total_amount,
  ROUND(AVG(passenger_count), 2) AS avg_passengers,
  ROUND(SUM(total_amount), 2) AS total_revenue,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (tpep_dropoff_datetime - tpep_pickup_datetime)) / 60.0),
    2
  ) AS avg_trip_duration_min
FROM read_parquet('yellow_tripdata_2024-01.parquet') t
JOIN read_csv_auto('taxi_zone_lookup.csv') z_pu
  ON t.PULocationID = z_pu.LocationID
JOIN read_csv_auto('taxi_zone_lookup.csv') z_do
  ON t.DOLocationID = z_do.LocationID
WHERE ...
GROUP BY 1, 2, 3, 4
ORDER BY trip_count DESC
```

### Script

```bash
node fetch-nyctlc.mjs
```

Output: `nyc_tlc_trips.csv` (~1.6 MB, ~24,000 rows)

---

## Summary Statistics

| Metric | Value |
|---|---|
| Total trips | 2,757,493 |
| Total revenue | $75,934,582.99 |
| Unique zones | 261 |
| Top route | Upper East Side South → Upper East Side North (21,073 trips) |

---

## Usage Ideas

- **Chord diagram**: flow between pickup and dropoff zones
- **Heatmap**: trip density by zone
- **Scatter plot**: trip distance vs. fare
- **Geospatial**: arcs between zone centroids
- **Dashboard**: revenue by zone, peak hours, average trip metrics

---

## Prerequisites

- Node.js ≥ 18

## License

Public domain — NYC Open Data.