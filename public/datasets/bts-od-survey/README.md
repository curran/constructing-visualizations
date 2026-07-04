# BTS Origin & Destination Survey

**Airline ticket origin-destination (O&D) data from the BTS TranStats survey.**

Route-level summaries of domestic airline tickets from the Bureau of
Transportation Statistics (BTS) Origin and Destination Survey (DB1B/DB1C).
Each row represents a directional route between two U.S. airports, with
passenger counts, average fares, and flight distances. Includes a companion
airport points file for geographic visualization.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `bts_airline_routes.csv` | ~8.5 MB | 244,965 routes × 10 columns |
| `bts_airports.csv` | ~500 KB | 6,054 airports × 7 columns |

---

## Schema (10 columns — Routes)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `origin_airport` | string | Origin airport code (IATA) | `JFK` |
| 2 | `origin_city` | string | Origin city name | `New York, NY` |
| 3 | `dest_airport` | string | Destination airport code | `LAX` |
| 4 | `dest_city` | string | Destination city name | `Los Angeles, CA` |
| 5 | `num_tickets` | number | Number of tickets | `1250` |
| 6 | `total_passengers` | number | Total passenger count | `1875` |
| 7 | `avg_fare` | number | Average fare ($) | `285.50` |
| 8 | `weighted_avg_fare` | number | Passenger-weighted avg fare ($) | `312.00` |
| 9 | `avg_distance_miles` | number | Average flight distance | `2475` |
| 10 | `carrier` | string | Airline code (optional) | `UA` |

### Schema — Airports (companion file)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `airport_code` | string | IATA code | `JFK` |
| 2 | `airport_name` | string | Airport name | `John F. Kennedy International` |
| 3 | `city` | string | City | `New York` |
| 4 | `country` | string | Country | `United States` |
| 5 | `latitude` | number | Latitude | `40.64` |
| 6 | `longitude` | number | Longitude | `-73.78` |
| 7 | `altitude` | number | Altitude (feet) | `13` |

---

## Methodology

### Source
```
https://transtats.bts.gov/PREZIP/Origin_and_Destination_Survey_DB1CMarket_2025_3.zip
```

### Processing Steps

1. **Download ZIP** from BTS TranStats.
2. **Extract CSV** from the ZIP archive (2.1 GB, 8.4M rows).
3. **Load into DuckDB** and run aggregation:

```sql
SELECT
  Origin AS origin_airport,
  Dest AS dest_airport,
  COUNT(*) AS num_tickets,
  SUM(Passengers) AS total_passengers,
  AVG(Fare) AS avg_fare,
  AVG(Distance) AS avg_distance_miles,
  SUM(Fare * Passengers) / SUM(Passengers) AS weighted_avg_fare
FROM 'DB1B*.csv'
WHERE Passengers > 0 AND Fare > 0
GROUP BY 1, 2
ORDER BY total_passengers DESC
```

4. **Join** with airport names using lookup CSV
   (`https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat`).
5. **Write output**.

### Prerequisites

- Node.js ≥ 18
- DuckDB CLI (for aggregating the 2 GB raw CSV)

### Expected Runtime

~5 minutes (download + DuckDB aggregation).

---

## Generation Script

Two scripts are provided:
- `fetch-bts.mjs` — Downloads the raw ZIP, extracts CSV, then uses DuckDB CLI for aggregation
- `aggregate-bts.mjs` — Runs the DuckDB aggregation on the already-extracted CSV using stdin piping

Run:
```bash
node fetch-bts.mjs
# or if the raw CSV is already extracted:
duckdb < query.sql
```

---

## Usage Ideas

- **Network diagram**: circular layout of routes between airports
- **Chord diagram**: flow between cities
- **Geospatial arcs**: great-circle arcs on a map
- **Scatter plot**: distance vs. fare, colored by carrier
- **Route dashboard**: busiest routes, highest fares, longest distances
- **Course use**: network visualization, node-link diagrams

---

## License

Public domain — U.S. federal government data.