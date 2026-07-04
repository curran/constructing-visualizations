# Pew Global Religious Composition

**Country-level religious composition estimates for 2010 and 2020.**

A dataset from the Pew Research Center providing estimated religious
composition percentages and populations for every country, for 2010 and
2020. Covers seven religious categories: Christianity, Islam, Hinduism,
Buddhism, Judaism, Other Religions, and Unaffiliated.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `pew_religion.csv` | ~94 KB | 1,288 rows (201 countries × up to 7 religions) |

---

## Schema (10 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `country` | string | Country name | `India` |
| 2 | `iso3` | string | ISO3 country code | `IND` |
| 3 | `region` | string | World region | `Asia-Pacific` |
| 4 | `year` | number | Reference year | `2020` |
| 5 | `religion` | string | Religion category | `Hinduism` |
| 6 | `pct_2010` | number | Population percentage 2010 | `80.0` |
| 7 | `pct_2020` | number | Population percentage 2020 | `79.4` |
| 8 | `population_2010` | number | Estimated population 2010 | `1243481564` |
| 9 | `population_2020` | number | Estimated population 2020 | `1402617696` |
| 10 | `diversity_index` | number | Religious diversity index (RDI score) | `4.03` |

Each row represents one religion category for one country. Years are
side-by-side (pct_2010 / pct_2020) for easy comparison of change over
time. Diversity index (RDI) is from 2020; see Pew's original documentation
for the methodology.

---

## Methodology

### Source

Downloaded as a ZIP from the Pew Research Center:
```
https://www.pewresearch.org/wp-content/uploads/sites/20/2025/06/Religious-Composition-2010-2020-dataset.zip
```

Contains:
- `Religious Composition 2010-2020 (percentages).csv` — religious composition percentages by country/year
- `Religious Composition 2010-2020 (diversity statistics).csv` — religious diversity index (RDI) scores
- `Religious Composition 2010-2020 (rounded counts).csv` — estimated population counts (rounded)
- `Religious Composition 2010-2020 (unrounded counts).csv` — estimated population counts (precise)
- `Religious Composition 2010-2020.xlsx` — combined Excel workbook with README

### Processing Steps

1. **Download ZIP** from Pew Research Center.
2. **Extract** the percentages and diversity CSVs.
3. **Parse** country-level rows (excluding regional/world aggregates).
4. **Pivot** religion columns into rows — one row per country × religion.
5. **Map** numeric UN country codes to ISO3 alpha-3 codes using `i18n-iso-countries`.
6. **Join** diversity index scores from the diversity CSV.
7. **Write** `pew_religion.csv` with the 10-column schema above.

### Prerequisites

- Node.js ≥ 18

### Expected Runtime

~10 seconds (download + extract + pivot).

---

## Usage Ideas

- **Stacked bar chart**: religious composition by country
- **Map**: dominant religion by country (choropleth)
- **Bubble chart**: population vs. religious diversity index
- **Side-by-side comparison**: 2010 vs. 2020 religious composition changes
- **Course use**: mapping, color scales, data transformation

---

## License

© Pew Research Center. Freely available for research and educational use.
