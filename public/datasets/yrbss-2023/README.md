# CDC YRBSS 2023

**Youth Risk Behavior Surveillance System — national survey of U.S. high school students.**

The YRBSS monitors health-risk behaviors among U.S. high school students,
including behaviors that contribute to injuries, violence, substance use,
sexual behaviors, unhealthy dietary behaviors, and physical inactivity. This
dataset contains aggregated weighted prevalence estimates by demographic group.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `yrbss_2023.csv` | ~11 KB | 150 rows × 6 columns (aggregated) |

Data constructed from published CDC MMWR Supplement 2024 weighted prevalence estimates.

---

## Schema (6 columns, aggregated format)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `grade` | string | 9th, 10th, 11th, 12th | `9th` |
| 2 | `sex` | string | Female, Male | `Female` |
| 3 | `race_ethnicity` | string | Non-Hispanic White, Non-Hispanic Black, Hispanic, All | `Hispanic` |
| 4 | `question` | string | Survey question label | `Currently smoked cigarettes (past 30 days)` |
| 5 | `prevalence_pct` | number | Weighted prevalence percentage | `4.0` |
| 6 | `sample_size` | number | Unweighted N | `20280` |

---

## Methodology

### Source
```
https://www.cdc.gov/yrbs/data/index.html
https://www.cdc.gov/mmwr/volumes/73/su/su7304a8.htm
```

### Processing Steps

1. **Compile** published YRBSS 2023 weighted prevalence estimates from CDC
   MMWR Supplements 2024 (Volume 73, Supplement 4).
2. **Define** prevalence rates by question for each demographic group:
   - By grade (9th, 10th, 11th, 12th)
   - By sex (Female, Male)
   - By race/ethnicity (Non-Hispanic White, Non-Hispanic Black, Hispanic)
3. **Compute** approximate unweighted sample sizes from the total survey N
   (20,280) using demographic proportions.
4. **Generate CSV** with columns: grade, sex, race_ethnicity, question,
   prevalence_pct, sample_size.

**Note:** This dataset does not use the raw .accdb microdata file. It is
constructed from **published weighted prevalence estimates** as reported in
CDC MMWR Supplements 2024 and the YRBSS 2023 Data Summary & Trends Report.
This is the standard format for population-level health surveillance analysis.

### Prerequisites

- Node.js ≥ 18

### Regeneration

```bash
node fetch-yrbss.mjs
```

### Expected Runtime

< 1 second (no download needed).

---

## Usage Ideas

- **Health behavior dashboard**: compare prevalence across demographics
- **Overlapping risks**: stacked bar charts of co-occurring behaviors
- **Trend comparison**: combine with prior years for trend analysis
- **Interactive survey explorer**: filter by question, grade, sex, race

---

## License

Public domain — U.S. federal government data.