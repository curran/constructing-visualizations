# NOAA Storm Events

**Storm event damage reports from the NOAA National Centers for Environmental Information.**

A curated dataset of storm events, narrowed to
key fields including event type, location, injuries, deaths, and property damage.
Sourced from the NOAA Storm Events Database.

---

## Dataset Files

| File | Size | Rows |
|---|---|---|
| `noaa_storm_events_2024.csv` | ~4.0 MB | 69,801 rows × 11 columns |

---

## Schema (11 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `begin_date` | string | ISO date (YYYY-MM-DD) | `2024-03-24` |
| 2 | `state` | string | State / territory name | `TENNESSEE` |
| 3 | `cz_name` | string | County/zone name | `SHARKEY` |
| 4 | `event_type` | string | Tornado, Flood, Hail, etc. | `Tornado` |
| 5 | `magnitude` | number | Magnitude (if applicable) | `2.0` |
| 6 | `magnitude_type` | string | EG (enhanced Fujita), MAG (hail size) | `EG` |
| 7 | `injuries` | number | Total injuries (direct + indirect) | `12` |
| 8 | `deaths` | number | Total deaths (direct + indirect) | `0` |
| 9 | `property_damage` | number | Property damage ($) | `5000000` |
| 10 | `crop_damage` | number | Crop damage ($) | `250000` |
| 11 | `tor_f_scale` | string | Tornado F-scale (if tornado) | `EF2` |

---

## Methodology

### Source
```
https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/
```

### Processing Steps

1. **Download** yearly gzipped CSV detail files from the NOAA FTP-style archive
   (filenames follow the pattern `StormEvents_details-ftp_v1.0_d{YYYY}_c{YYYYMMDD}.csv.gz`).
2. **Decompress** and **parse** each CSV (handling double-quoted fields).
3. **Select** narrowed field set (11 columns as per schema above).
4. **Aggregate** injury/death totals from direct + indirect columns.
5. **Parse damage strings**: convert "1.00K" → 1000, "2.50M" → 2500000, etc.
6. **Write** as plain CSV.

### Scripts

**Full 2021–2024 dataset** (~276k rows, requires downloading ~48 MB):
```bash
node fetch-storms.mjs
```

**2024-only dataset** (~70k rows, faster download):
```bash
node fetch-storms-2024.mjs
```

### Prerequisites

- Node.js ≥ 18 (uses only built-in modules: `https`, `zlib`, `fs`, `path`, `stream`)

---

## Known Limitations

| Limitation | Impact |
|---|---|
| Damage amounts as strings with K/M/B suffixes | Must parse carefully (handled in script) |
| Some entries have missing magnitude values | Field left empty or 0 |
| County names may use different casing across years | Check consistency before joining |
| `tor_f_scale` contains anomalous numeric values in source data (e.g., "49.00") | Filtered out; only EF-scale strings retained |

---

## Usage Ideas

- **Storm dashboard**: frequency by state and event type
- **Damage heatmap**: choropleth of property damage by county
- **Tornado analysis**: F-scale distribution, path lengths
- **Seasonal patterns**: storm events by month across years

---

## License

Public domain — U.S. federal government data.