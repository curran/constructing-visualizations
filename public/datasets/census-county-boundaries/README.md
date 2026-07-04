# Census County Boundary Files (Cartographic)

**U.S. county boundaries as centroids from Census Gazetteer data.**

County boundary data from the U.S. Census Bureau's 2023 Gazetteer
County Files. Instead of downloading and converting Shapefiles, this
dataset uses the pre-computed centroid coordinates (INTPTLAT, INTPTLONG)
from the Gazetteer, which is simpler, faster, and avoids GIS toolchain
dependencies.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `county_boundaries.csv` | 214 KB | 3,222 counties × 8 columns |

---

## Schema (8 columns — centroid CSV)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `GEOID` | string | County FIPS code (5-digit) | `06037` |
| 2 | `name` | string | County name | `Los Angeles County` |
| 3 | `state_fips` | string | State FIPS code (2-digit) | `06` |
| 4 | `state_abbr` | string | State abbreviation | `CA` |
| 5 | `aland` | number | Land area (sq meters) | `10515988121` |
| 6 | `awater` | number | Water area (sq meters) | `1785003256` |
| 7 | `centroid_lat` | number | Latitude of centroid | `34.196398` |
| 8 | `centroid_lng` | number | Longitude of centroid | `-118.261862` |

---

## Methodology

### Source
```
https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip
```

### Processing Steps

1. **Download ZIP** containing the Gazetteer text file.
2. **Extract** the tab-delimited text file.
3. **Parse** each line: USPS, GEOID, ANSICODE, NAME, ALAND, AWATER, ALAND_SQMI, AWATER_SQMI, INTPTLAT, INTPTLONG.
4. **Write CSV** with 8 columns: GEOID, name, state_fips, state_abbr, aland, awater, centroid_lat, centroid_lng.

### Usage

```bash
node fetch-boundaries.mjs
```

### Dependencies

- Node.js ≥ 18
- `csv-stringify` — CSV output
- `adm-zip` — zip extraction
- No Shapefile, mapshaper, or GDAL tools needed.

### Expected Runtime

~10 seconds (download + parse).

---

## Coverage

| Category | Count |
|---|---|
| Counties and equivalents | 3,222 |
| Unique states/territories | 52 (50 states + DC + PR) |

---

## Usage Ideas

- **Choropleth map**: join with ACS or PLACES data for county mapping
- **Dot map**: plot county centroids with size encoding
- **Course use**: basemap for geographic data visualization lessons
- **Voronoi diagram**: create tessellation from centroids for clean maps

---

## License

Public domain — U.S. federal government data.
