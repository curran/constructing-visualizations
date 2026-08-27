# UN World Population Prospects 2024

**Global population estimates and projections by country (1950-2024).**

The UN World Population Prospects 2024 dataset provides demographic indicators
for all countries and areas, including total population by sex, median age,
fertility rates, life expectancy, birth/death rates, and urbanization. This
is a filtered extract covering 1950-2025 with a curated set of key indicators.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `un_wpp_2024.csv` | ~1.9 MB | 16,965 rows (261 countries × 65 years) × 14 columns |

**Note:** Data sourced from the World Bank API (World Development Indicators) since the
UN Population Division's direct CSV download was unavailable. Coverage is 1960-2024
(the World Bank data starts from 1960). The World Bank indicators are the authoritative
source for these demographic indicators and closely match the UN WPP data.

Missing field: `median_age` is not available via the World Bank API and is left empty
in this dataset.

---

## Schema (14 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `iso_code` | string | ISO3 country code | `IND` |
| 2 | `location` | string | Country or area name | `India` |
| 3 | `region` | string | UN Region | `Asia` |
| 4 | `subregion` | string | UN Sub-region | `Southern Asia` |
| 5 | `year` | number | Year | `2023` |
| 6 | `total_population` | number | Total population (thousands) | `1428627` |
| 7 | `pop_male` | number | Male population (thousands) | `736482` |
| 8 | `pop_female` | number | Female population (thousands) | `692145` |
| 9 | `median_age` | number | Median age | `28.7` |
| 10 | `birth_rate` | number | Crude birth rate (per 1000) | `16.2` |
| 11 | `death_rate` | number | Crude death rate (per 1000) | `7.3` |
| 12 | `life_expectancy` | number | Life expectancy at birth (years) | `70.7` |
| 13 | `fertility_rate` | number | Total fertility rate | `2.0` |
| 14 | `urban_pct` | number | Urban population percentage | `35.9` |

---

## Methodology

### Source
```
https://api.worldbank.org/v2/country/all/indicator/{indicator_id}?format=json
```

### Indicators Used (World Bank WDI)

| World Bank ID | Column |
|---|---|
| `SP.POP.TOTL` | total_population |
| `SP.POP.TOTL.MA.IN` | pop_male |
| `SP.POP.TOTL.FE.IN` | pop_female |
| `SP.DYN.LE00.IN` | life_expectancy |
| `SP.DYN.CBRT.IN` | birth_rate |
| `SP.DYN.CDRT.IN` | death_rate |
| `SP.DYN.TFRT.IN` | fertility_rate |
| `SP.URB.TOTL.IN.ZS` | urban_pct |

### Processing Steps

1. **Fetch country region metadata** from ISO-3166 country code registry (GitHub).
2. **For each indicator**, call the World Bank API with `per_page=20000` and `date=1960:2024`.
3. **Parse JSON responses** and index by `countryiso3code_year` key.
4. **Merge** all indicators into wide format by (country, year).
5. **Write CSV** with 14 columns.

### Prerequisites

- Node.js ≥ 18
- `csv-stringify` npm package

### Expected Runtime

~10-15 seconds (8 API calls + processing).

### Known Limitations

- **Years**: 1960-2024 (not 1950 as the original UN data)
- **Median age**: Not available via World Bank API; left empty
- **Regional groupings**: Uses ISO-3166 regions, not UN M49 regions (similar but not identical)

---

## Usage Ideas

- **Stream graph**: population change over time by region
- **Line chart**: fertility rate trends by country
- **Bubble chart**: life expectancy vs. fertility by population size
- **Population pyramid**: age/sex distribution for a selected year
- **Map**: choropleth of population density or growth rate
- **Course use**: time series visualization, demographic analysis

---

## License

© United Nations. Freely available for research and educational use.