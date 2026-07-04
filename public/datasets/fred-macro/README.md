# FRED Macro Indicators

**Key U.S. macroeconomic indicators from the Federal Reserve Economic Data (FRED).**

A collection of seven key economic indicators: S&P 500, Federal Funds Rate,
CPI, Unemployment Rate, Real GDP, 10-Year Treasury Rate, and 10-Year Breakeven
Inflation Rate. All series are resampled to monthly frequency and merged into
a wide-format table spanning from 2000 to the present.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `fred_macro.csv` | ~13.5 KB | 313 rows × 8 columns (wide format) |

---

## Schema (8 columns, wide format)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `date` | string | ISO date (monthly, YYYY-MM-DD) | `2023-01-01` |
| 2 | `sp500` | number | S&P 500 Index | `4076.57` |
| 3 | `fed_funds_rate` | number | Federal Funds Effective Rate (%) | `4.33` |
| 4 | `cpi` | number | Consumer Price Index (1982-84=100) | `299.17` |
| 5 | `unemployment_rate` | number | Unemployment Rate (%) | `3.4` |
| 6 | `real_gdp` | number | Real GDP (billions of chained 2017 $) | `20252.6` |
| 7 | `treasury_10y` | number | 10-Year Treasury Constant Maturity Rate (%) | `3.52` |
| 8 | `breakeven_inflation` | number | 10-Year Breakeven Inflation Rate (%) | `2.26` |

---

## Methodology

### Source
```
https://fred.stlouisfed.org/graph/fredgraph.csv
```

No API key required — uses FRED's direct CSV export feature.

### Series Pulled

| Series ID | Column Name | Native Frequency | Coverage |
|---|---|---|---|
| `SP500` | `sp500` | Daily | 2016-06 onward |
| `DFF` | `fed_funds_rate` | Daily | Full (2000-01 onward) |
| `CPIAUCSL` | `cpi` | Monthly | Full |
| `UNRATE` | `unemployment_rate` | Monthly | Full |
| `GDPC1` | `real_gdp` | Quarterly | Full |
| `DGS10` | `treasury_10y` | Daily | Full |
| `T10YIE` | `breakeven_inflation` | Daily | Partial (2003-01 onward) |

### Processing Steps

1. **For each series**, download CSV from FRED's direct CSV export URL:
   `https://fred.stlouisfed.org/graph/fredgraph.csv?id=SERIES_ID&cosd=2000-01-01&coed=2026-01-01`
2. **Parse CSV** (date, value columns).
3. **Skip** `"."` values (missing data).
4. **Resample** daily/quarterly series to monthly (last available value in each month).
5. **Merge** all series into wide format by month.
6. **Write CSV**.

### Note on Coverage

- **S&P 500** (`SP500`): FRED's S&P 500 series begins in 2016-06. Earlier data
  is not available from this series.
- **Breakeven Inflation** (`T10YIE`): Series begins in 2003-01.
- **Real GDP** (`GDPC1`): Quarterly frequency, so ~105 data points in the
  monthly table.
- All other series have complete coverage from 2000-01.

### Generation Script

Run `node fetch-macro.mjs` to regenerate the dataset. No npm dependencies
required — uses only Node.js built-in `fetch` (≥ 18).

### Prerequisites

- Node.js ≥ 18 (built-in `fetch`)
- No API key required

### Expected Runtime

~10 seconds (7 series × 1 HTTP request each).

---

## Usage Ideas

- **Multi-line time series**: overlay all indicators on a single timeline
- **Scatter plot**: unemployment vs. inflation (Phillips curve)
- **Correlation matrix**: relationship between indicators over time
- **Financial dashboard**: key economic indicators at a glance
- **Animated transition**: year-by-year animation of indicator changes

---

## License

Data is © Federal Reserve Bank of St. Louis. Freely available for educational
and research use.