# ACS 5-Year County Data

**American Community Survey 5-year estimates (2019-2023) at the county level.**

A comprehensive slice of U.S. Census Bureau ACS data covering demographic
characteristics, socioeconomic indicators, housing, and education for all
3,222 U.S. counties and county-equivalents. Sourced from the Census Bureau's
Gazetteer files and detailed summary file tables (B-series) via the Bureau's
public FTP server.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `acs_5yr_county.csv` | 0.29 MB | 3,222 counties × 16 columns |

---

## Schema (16 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `GEOID` | string | County FIPS code | `06037` |
| 2 | `name` | string | County name | `Los Angeles County` |
| 3 | `state` | string | State name | `California` |
| 4 | `total_population` | number | Total population | `9848406` |
| 5 | `median_age` | number | Median age | `37.9` |
| 6 | `pct_white` | number | % White alone | `25.2` |
| 7 | `pct_black` | number | % Black or African American alone | `7.5` |
| 8 | `pct_hispanic` | number | % Hispanic or Latino | `48.3` |
| 9 | `pct_asian` | number | % Asian alone | `14.8` |
| 10 | `pct_bachelors_or_higher` | number | % bachelor's degree or higher | `35.5` |
| 11 | `median_household_income` | number | Median household income ($) | `87760` |
| 12 | `pct_below_poverty` | number | % below poverty level | `13.6` |
| 13 | `pct_owner_occupied` | number | % owner-occupied housing | `46.1` |
| 14 | `median_rent` | number | Median gross rent ($) | `1893` |
| 15 | `total_housing_units` | number | Total housing units | `3624084` |
| 16 | `land_area` | number | Land area (sq mi) — from Gazetteer | `4060.246` |

---

## Methodology

### Sources

| Data | Source | URL |
|---|---|---|
| County names, state, land area | 2023 Gazetteer Files | `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip` |
| Demographic & socioeconomic data | ACS 5-Year Summary File (2023) | `https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/` |

### Detailed Tables Used

| Schema Column | ACS Table | Variable(s) |
|---|---|---|
| `total_population` | B01001 | `B01001_E001` |
| `median_age` | B01002 | `B01002_E001` |
| `pct_white` | B03002 | `B03002_E003` / `B03002_E001 × 100` |
| `pct_black` | B03002 | `B03002_E004` / `B03002_E001 × 100` |
| `pct_hispanic` | B03002 | `B03002_E012` / `B03002_E001 × 100` |
| `pct_asian` | B03002 | `B03002_E006` / `B03002_E001 × 100` |
| `pct_bachelors_or_higher` | B15003 | `(B15003_E022+E023+E024+E025)` / `B15003_E001 × 100` |
| `median_household_income` | B19013 | `B19013_E001` |
| `pct_below_poverty` | B17001 | `B17001_E002` / `B17001_E001 × 100` |
| `pct_owner_occupied` | B25003 | `B25003_E002` / `B25003_E001 × 100` |
| `median_rent` | B25064 | `B25064_E001` |
| `total_housing_units` | B25001 | `B25001_E001` |

### Processing Steps

1. **Download Gazetteer zip** and parse the pipe-delimited county records for
   GEOID, county name, state abbreviation, and land area (sq mi).
2. **Download nine ACS summary file .dat files** from the Census Bureau's
   public FTP server — each file is a pipe-delimited table with GEO_ID in the
   first column (prefixed `0500000US` for county-level).
3. **Stream each .dat file** row-by-row, filtering to county-level rows,
   extracting only the estimate columns needed.
4. **Merge** all data by 5-digit county GEOID.
5. **Compute derived percentages** (race, education, poverty, owner-occupied).
6. **Write** the final CSV with 16 columns.

### Prerequisites

- Node.js ≥ 18
- No Census API key required — all data is public domain via FTP

### Expected Runtime

~2–5 minutes (downloads ~120 MB of compressed data files).

### Caching

Downloaded files are cached in `.cache/` for reuse. Delete `.cache/` to force
a fresh download.

---

## Usage Ideas

- **Choropleth map**: county-level median income or education
- **Demographic dashboard**: compare racial composition across counties
- **Scatter plot**: income vs. education by county
- **Bubble map**: population size by county with income color encoding
- **Course use**: paired with county boundaries for geographic visualization

---

## License

Public domain — U.S. federal government data.