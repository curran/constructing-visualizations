# CDC PLACES

**Health outcomes, prevention, and health risk behaviors at the county level.**

The CDC PLACES dataset provides model-based estimates of health-related
measures for all U.S. counties. Derived from the Behavioral Risk Factor
Surveillance System (BRFSS) combined with small-area estimation methods,
it covers obesity, diabetes, high blood pressure, physical activity, smoking,
sleep, food insecurity, and more.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `cdc_places.csv` | 269 KB | 3,144 counties × 17 columns |

---

## Schema (17 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `location_name` | string | County name | `Los Angeles County` |
| 2 | `state_abbr` | string | State abbreviation | `CA` |
| 3 | `state_desc` | string | State full name | `California` |
| 4 | `county_fips` | string | County FIPS code | `06037` |
| 5 | `obesity_pct` | number | Obesity crude prevalence (%) | `24.1` |
| 6 | `diabetes_pct` | number | Diabetes crude prevalence (%) | `10.2` |
| 7 | `high_blood_pressure_pct` | number | High blood pressure (%) | `31.5` |
| 8 | `asthma_pct` | number | Current asthma (%) | `9.8` |
| 9 | `depression_pct` | number | Depression (%) | `18.3` |
| 10 | `checkup_pct` | number | Recent checkup (%) | `72.1` |
| 11 | `smoking_pct` | number | Current smoking (%) | `12.4` |
| 12 | `binge_drinking_pct` | number | Binge drinking (%) | `16.2` |
| 13 | `no_physical_activity_pct` | number | No leisure-time physical activity (%) | `20.8` |
| 14 | `insufficient_sleep_pct` | number | Insufficient sleep (%) | `35.6` |
| 15 | `food_insecure_pct` | number | Food insecurity (%) | `11.5` |
| 16 | `housing_insecure_pct` | number | Housing insecurity (%) | `8.3` |
| 17 | `no_health_insurance_pct` | number | No health insurance (%) | `7.9` |

---

## Methodology

### Source
```
https://data.cdc.gov/api/views/d3i6-k6z5/rows.csv?accessType=DOWNLOAD
```

The source dataset is **PLACES: County Data (GIS Friendly Format), 2024 release**
from the CDC PLACES data portal (data.cdc.gov, ID `d3i6-k6z5`).

### Processing Steps

1. **Download CSV** from the CDC data portal (GIS-friendly wide format; ~4.8 MB).
2. **Extract** 13 curated health measure columns (*_CrudePrev).
3. **Map** source columns to clean snake_case names.
4. **Keep** geographic identifiers (location_name, state_abbr, state_desc, county_fips).
5. **Write** `cdc_places.csv`.

### Prerequisites

- Node.js ≥ 18

### Expected Runtime

~15 seconds (download + parse + write).

### Notes

- Food insecurity and housing insecurity measures (FOODINSECU, HOUSINSECU) are not available for all counties; some rows have empty values for these columns.
- The dataset covers all 50 U.S. states plus the District of Columbia (51 geographic areas).

---

## Usage Ideas

- **Health choropleth**: county-level obesity or diabetes map
- **Scatter matrix**: pairwise relationships between health measures
- **Risk factor comparison**: compare smoking vs. physical inactivity by region
- **Bubble map**: county health outcomes with population encoding
- **Paired with ACS**: analyze health outcomes against demographic/socioeconomic data

---

## License

Public domain — U.S. federal government data.