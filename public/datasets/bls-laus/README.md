# BLS LAUS (Local Area Unemployment Statistics)

**County-level unemployment, employment, and labor force data.**

The Local Area Unemployment Statistics (LAUS) program produces monthly
estimates of labor force, employment, unemployment, and the unemployment
rate for all U.S. counties and their equivalents (including Puerto Rico
municipios). This dataset contains annual aggregations (monthly averages)
of these estimates, covering **1990–2026**.

---

## Dataset File

| File | Size | Rows | Counties | Year Range |
|---|---|---|---|---|
| `bls_laus_county.csv` | 6.3 MB | 119,103 | 3,225 | 1990 – 2026 |

---

## Schema (8 columns, annual aggregation)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `geoid` | string | County FIPS code (5-digit) | `06037` |
| 2 | `county_name` | string | County name | `Los Angeles County` |
| 3 | `state_abbr` | string | State abbreviation | `CA` |
| 4 | `year` | number | Year | `2023` |
| 5 | `labor_force` | number | Labor force (thousands) | `5021.5` |
| 6 | `employment` | number | Employed (thousands) | `4720.3` |
| 7 | `unemployment` | number | Unemployed (thousands) | `301.2` |
| 8 | `unemployment_rate` | number | Unemployment rate (percent) | `6.0` |

---

## Methodology

### Source

Eight BLS tab-separated data files covering decadal year ranges:

```
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU90-94
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU95-99
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU00-04
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU05-09
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU10-14
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU15-19
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU20-24
https://download.bls.gov/pub/time.series/la/la.data.0.CurrentU25-29
```

Reference files:
- `la.area` – area definitions mapping area codes to county names and states
- `la.series` – series definitions mapping series IDs to area codes and measure codes

### Processing Steps

1. **Download** LAUS data files from BLS FTP (tab-separated format).
2. **Download** `la.area` and `la.series` reference files.
3. **Filter** to county series (series IDs starting with `LAUCN`).
4. **Keep** only the four standard measures:
   - Measure `03` = unemployment rate (%)
   - Measure `04` = unemployment (count, thousands)
   - Measure `05` = employment (count, thousands)
   - Measure `06` = labor force (count, thousands)
5. **Aggregate** monthly values to annual averages per county-year.
6. **Map** area codes to county names and state abbreviations via `la.area`.
7. **Output** as CSV sorted by geoid and year.

### Series ID Format

```
LAUCN010010000000003
││││││││││││││││││││
│││││└───────────────── measure code (03 = unemployment rate)
││││└────────────────── zero-padded area
│││└─────────────────── 5-digit county FIPS
└┴┴┴┴────────────────── prefix (LAUCN = county)
```

### Prerequisites

- Node.js ≥ 18 (for `fetch()` API)
- No API key needed

### Runtime

~120 seconds (download + parsing + aggregation) on a typical connection.

### Regeneration

```bash
cd plans/new/datasets/bls-laus
node fetch-laus.mjs
```

---

## Usage Ideas

- **Choropleth map**: county unemployment rate over time
- **Line chart**: unemployment trends by county or state
- **Scatter plot**: labor force participation vs. unemployment
- **Small multiples**: compare county unemployment across years
- **Course use**: economic indicators, time series visualization

---

## License

Public domain — U.S. federal government data.
