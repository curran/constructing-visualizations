# UCI Online Retail II

**E-commerce transaction data from a UK-based online retailer (2009-2011).**

A public dataset from the UCI Machine Learning Repository containing all
transactions occurring between 01/12/2009 and 09/12/2011 for a UK-based
online retail company selling unique all-occasion gifts. The dataset includes
product-level details, customer information, and country data.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `online_retail_ii.csv` | 8.0 MB | 127,530 rows × 8 columns (aggregated) |

Source Excel file is 43.5 MB raw (1,067,371 raw rows across 2 sheets).

---

## Schema (8 columns, aggregated format)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `month` | string | ISO month | `2010-12` |
| 2 | `country` | string | Country name | `United Kingdom` |
| 3 | `stock_code` | string | Product code | `85123A` |
| 4 | `description` | string | Product description | `WHITE HANGING HEART T-LIGHT HOLDER` |
| 5 | `total_quantity` | number | Sum of quantities sold | `150` |
| 6 | `total_revenue` | number | Sum of Quantity × UnitPrice | `2999.50` |
| 7 | `num_transactions` | number | Count of invoices | `42` |
| 8 | `num_customers` | number | Unique customer count | `18` |

---

## Methodology

### Source
```
https://archive.ics.uci.edu/ml/machine-learning-databases/00502/online_retail_II.xlsx
```

### Processing Steps

1. **Download** the 43.5 MB Excel file via HTTP.
2. **Read workbook** using the `xlsx` npm package (`cellDates: true`), iterate
   over both sheets (Year 2009-2010, Year 2010-2011).
3. **Filter** out cancellations (Invoice starts with "C"), rows with
   non-positive quantity or unit price, and rows missing critical fields.
4. **Compute** `revenue = Quantity × UnitPrice`.
5. **Aggregate** to month × country × product level, computing
   `total_quantity`, `total_revenue`, `num_transactions` (distinct invoices),
   and `num_customers` (distinct customer IDs).
6. **Write** sorted CSV (sorted by month, then country, then stock_code).

### Prerequisites

- Node.js ≥ 18
- `xlsx` npm package

### Expected Runtime

~20-30 seconds (download + processing).

### Actual Stats

| Metric | Value |
|---|---|
| Raw rows (Sheet 1: Year 2009-2010) | 525,461 |
| Raw rows (Sheet 2: Year 2010-2011) | 541,910 |
| Total raw rows | 1,067,371 |
| Valid rows after filtering | 1,041,670 |
| Aggregated groups (CSV rows) | 127,530 |
| CSV size | 8.02 MB |
| Processing time (after download) | ~1.5 seconds |

---

## Known Limitations

| Limitation | Impact |
|---|---|
| No customer identifiers after 2010 | Can't track cohorts across years; `num_customers` may be 0 for some rows |
| Cancellations as negative quantities | Must filter carefully — filtered out by `!quantity <= 0` |
| Free-text product descriptions | Some contain encoding artifacts |
| Some CustomerID values are empty | `num_customers` shows 0 for rows with missing customer ID |

---

## Usage Ideas

- **Sales dashboard**: revenue trends by month and country
- **Product analysis**: top-selling products, seasonal patterns
- **Customer geography**: map of transactions by country
- **Revenue decomposition**: contribution by product category

---

## License

The dataset is provided by the UCI Machine Learning Repository for research
and educational purposes.
