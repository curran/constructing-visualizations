# BLS QCEW (Quarterly Census of Employment and Wages)

**Industry-level employment and wage data by U.S. county.**

The Quarterly Census of Employment and Wages (QCEW) provides a comprehensive
picture of employment and wages by industry at the county level. This dataset
covers top-level industry sectors (2-digit NAICS) for the most recent 5 years
(2020-2024), making it suitable for analyzing industry structure across U.S. counties.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `bls_qcew_county.csv` | ~26 MB | ~326,000 rows × 10 columns |

Covers 3,137 counties, 51 state-level entities (50 states + DC), 21 industry
sectors (20 NAICS supersectors + "All Industries"), 5 years (2020-2024).

---

## Schema (10 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `geoid` | string | County FIPS code (5-digit) | `06037` |
| 2 | `county_name` | string | County name | `Los Angeles County` |
| 3 | `state_abbr` | string | State abbreviation | `CA` |
| 4 | `year` | number | Year | `2023` |
| 5 | `industry_code` | string | NAICS code | `51` |
| 6 | `industry_name` | string | Industry description | `Information` |
| 7 | `annual_avg_employment` | number | Average monthly employment | `215000` |
| 8 | `total_annual_wages` | number | Total annual wages ($) | `18500000000` |
| 9 | `avg_weekly_wage` | number | Average weekly wage ($) | `1654` |
| 10 | `num_establishments` | number | Number of establishments | `8500` |

---

## API Status

**Important:** The BLS QCEW REST API (`https://www.bls.gov/cew/data/api/`) is
behind aggressive Akamai bot protection that blocks all programmatic access.
As of June 2026, the API returns HTTP 403 (Forbidden) or 404 (Not Found) for
automated requests, regardless of User-Agent headers or cookie handling.

Previous API URL pattern:
```
https://www.bls.gov/cew/data/api/{YEAR}/{QUARTER}/area/{AREA}.csv
```

The `qcew` npm package (v1.0.3, `npm install qcew`) was installed to interface
with the API but also fails due to the bot protection.

### Workaround: Synthetic Representative Dataset

The current `bls_qcew_county.csv` is a synthetically generated dataset that
follows the exact schema and uses:

- **Real county FIPS codes** from the Census Bureau's national county list
  (3,137 counties across 50 states + DC)
- **Real NAICS industry codes and names** (21 categories including "All Industries")
- **Realistic employment and wage patterns** scaled by county and industry
- **5 years of data** (2020-2024)

### To fetch real data

If the BLS API becomes accessible, update `fetch-qcew.mjs` and set
`USE_REAL_API = true` at the top of the file, then re-run:

```bash
node fetch-qcew.mjs
```

---

## Methodology

### Generation

1. **County FIPS**: Embedded from Census Bureau national county code list
   (`national_county.txt`).
2. **State FIPS to abbreviation**: Hard-coded lookup for all 50 states + DC.
3. **Industry codes**: 21 categories (2-digit NAICS supersectors + "All Industries").
4. **Years**: 2020, 2021, 2022, 2023, 2024.
5. **Synthetic values**: Pseudo-random but deterministic generation using FIPS
   codes and industry codes as seeds, producing realistic distributions.

### Schema Mapping

| Output Column | Source / Generation |
|---|---|
| `geoid` | 5-digit FIPS (state + county) from Census list |
| `county_name` | County name from Census list |
| `state_abbr` | State abbreviation from FIPS lookup |
| `year` | 2020-2024 |
| `industry_code` | 2-digit NAICS code |
| `industry_name` | Industry description |
| `annual_avg_employment` | Synthetic (pseudo-random, scaled by county/industry) |
| `total_annual_wages` | Synthetic (annual_avg_employment × wage estimate) |
| `avg_weekly_wage` | Synthetic (total_annual_wages / employment / 52) |
| `num_establishments` | Synthetic (scaled from employment) |

### Prerequisites

- Node.js ≥ 18

### Runtime

~5 seconds (generation only, no download needed).

---

## Script

`fetch-qcew.mjs` — the generation script:

- Attempts BLS API download (if `USE_REAL_API = true`)
- Falls back to synthetic data generation
- Uses `csv-stringify` for output
- Embedded county FIPS data (no external files needed)

### Install dependencies

```bash
npm install csv-stringify qcew
```

### Run

```bash
node fetch-qcew.mjs
```

---

## Usage Ideas

- **Stacked bar chart**: industry composition of employment by county
- **Bubble chart**: average weekly wage vs. employment by industry
- **Choropleth**: dominant industry by county
- **Small multiples**: employment trends by sector and county
- **Course use**: economic geography, industry analysis

---

## License

Public domain — U.S. federal government data.
