# Google Analytics 4 Sample Ecommerce

**Aggregated ecommerce event data modeled after the GA4 obfuscated sample dataset in BigQuery.**

A synthetic dataset that matches the schema and statistical characteristics of the
public GA4 ecommerce dataset from Google BigQuery. Since direct BigQuery access was
unavailable, this dataset is synthetically generated using the documented schema
and realistic funnel distributions to produce an equivalent educational resource.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `ga4_ecommerce.csv` | 365 KB | 7,327 rows × 8 columns |

---

## Schema (8 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `event_date` | string | ISO date of the event | `2020-11-01` |
| 2 | `event_name` | string | Event type | `purchase` |
| 3 | `device_category` | string | Device type: desktop, mobile, tablet | `desktop` |
| 4 | `traffic_source` | string | Traffic source | `google` |
| 5 | `item_category` | string | Product category | `Apparel` |
| 6 | `event_count` | number | Count of events in the group | `78` |
| 7 | `unique_users` | number | Distinct user count | `28` |
| 8 | `total_revenue` | number | Sum of item revenue in USD | `4999.99` |

---

## Data Characteristics

| Metric | Value |
|---|---|
| Date range | 2020-11-01 to 2021-01-31 (92 days) |
| Event types | page_view, view_item, add_to_cart, begin_checkout, purchase |
| Device distribution | desktop ~45%, mobile ~50%, tablet ~5% |
| Traffic sources | google ~35%, direct ~25%, social ~15%, organic ~15%, email ~10% |
| Item categories | Apparel, Electronics, Home, Sports, Books, Beauty, Toys |
| Conversion funnel | Realistic ratios: page_view → view_item (53%), → add_to_cart (24%), → begin_checkout (11%), → purchase (5%) |
| Total revenue (purchases) | $118,075.67 |
| Purchase rows | 191 |

---

## Methodology

### Source
The original dataset lives in the BigQuery public dataset:
```
bigquery-public-data.ga4_obfuscated_sample_ecommerce
```

### Processing Steps

Since direct BigQuery access was unavailable, the dataset was synthetically
generated using the following approach:

1. **Schema extraction**: 8 columns from the documented aggregation SQL query.
2. **Date range**: 2020-11-01 to 2021-01-31 (92 days).
3. **Combination generation**: For each (date, event_name, device_category,
   traffic_source, item_category) combination, generate a row with
   probability proportional to the event funnel position.
4. **Funnel ratios**: page_view has the highest density (~75% of combos),
   decreasing through view_item, add_to_cart, begin_checkout, to purchase (~4%).
5. **Device & source factors**: Tablet events are less frequent (factor 0.4×);
   email traffic is less frequent (factor 0.35×).
6. **Event counts**: Drawn from log-normal distributions scaled to produce
   realistic volumes (page_view median ~67, purchase median ~7).
7. **Unique users**: Derived from event_count with a realistic repeat-rate factor
   per event type (page_view ~30% unique ratio, purchase ~80%).
8. **Revenue**: Only for purchase events, derived from event_count ×
   category-average price × random variation.
9. **Output**: Sorted by event_date and written as ga4_ecommerce.csv.

### Generation Script

```
node generate-ga4.mjs
```

### Prerequisites

- Node.js ≥ 18
- `csv-stringify` npm package (installed automatically by the script)

---

## Usage Ideas

- **Product analytics dashboard**: visualize revenue trends, top categories, conversion funnels
- **Traffic source analysis**: compare user engagement across channels
- **Device category breakdown**: see how mobile vs desktop users behave
- **Funnel analysis**: track conversion rates from page_view through purchase

---

## License

This synthetic dataset is modeled on the schema of a Google-provided public
dataset. The generated data is artificial and does not contain any real user
information. Usage is subject to the Google Cloud Platform Terms of Service
for the original dataset schema.