# NASA Exoplanet Archive

**Confirmed exoplanets from the NASA Exoplanet Archive, with physical properties.**

A comprehensive catalog of all confirmed exoplanets from the NASA Exoplanet
Archive, accessed via the Table Access Protocol (TAP) API. Each row contains
the planet name, host star, discovery method, orbital properties, and physical
characteristics.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `nasa_exoplanets.csv` | ~2.5 MB | ~27,500 rows × 11 columns (~4,740 unique planets) |

---

## Schema (11 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `pl_name` | string | Planet name | `Kepler-10 b` |
| 2 | `hostname` | string | Host star name | `Kepler-10` |
| 3 | `discoverymethod` | string | Transit, Radial Velocity, etc. | `Transit` |
| 4 | `disc_year` | number | Discovery year | `2011` |
| 5 | `pl_rade` | number | Planet radius (Earth radii) | `1.47` |
| 6 | `pl_bmasse` | number | Planet mass (Earth masses) | `4.6` |
| 7 | `pl_orbper` | number | Orbital period (days) | `0.84` |
| 8 | `st_teff` | number | Stellar effective temperature (K) | `5627` |
| 9 | `ra` | number | Right ascension (degrees) | `285.68` |
| 10 | `dec` | number | Declination (degrees) | `50.24` |
| 11 | `planet_type` | string | Earth-like / Neptune-like / Jupiter-like | `Earth-like` |

### Planet Type Classification

| Type | Radius Range |
|---|---|
| Earth-like | `pl_rade < 1.5` |
| Neptune-like | `1.5 ≤ pl_rade < 4.0` |
| Jupiter-like | `pl_rade ≥ 4.0` |

---

## Methodology

### Source
```
https://exoplanetarchive.ipac.caltech.edu/TAP/sync
```

The TAP (Table Access Protocol) endpoint supports SQL-like queries and returns
CSV, JSON, or VOTable formats.

### TAP Query

```
SELECT pl_name, hostname, discoverymethod, disc_year, pl_rade, pl_bmasse,
       pl_orbper, st_teff, ra, dec
FROM ps
WHERE pl_rade IS NOT NULL
ORDER BY disc_year DESC
```

### Processing Steps

1. **Fetch CSV** directly from the TAP endpoint.
2. **Parse CSV** with a custom parser (no dependencies).
3. **Coerce types**: `pl_rade`, `pl_bmasse`, `pl_orbper`, `st_teff` → float;
   `disc_year` → int.
4. **Derive** `planet_type` column based on radius ranges.
5. **Write CSV**.

### Note: Multiple Rows per Planet

The NASA Exoplanet Archive `ps` table contains multiple rows per planet — one
per parameter measurement from different studies or publications. The TAP query
returns all available records where `pl_rade` is non-null. This means a single
planet may appear multiple times with different values for `pl_bmasse`,
`pl_orbper`, `st_teff`, etc. Each row represents a measurement study, not
a unique planet. To deduplicate, group by `pl_name` and apply your preferred
aggregation (e.g., median or best-quality flag).

### Generation Script

Run `node fetch-exoplanets.mjs` to regenerate the dataset. No npm dependencies
required — uses only Node.js built-in `fetch` (≥ 18).

### Prerequisites

- Node.js ≥ 18 (built-in `fetch`)

### Expected Runtime

~10 seconds (API call + parsing).

---

## Usage Ideas

- **Scatter plot**: planet radius vs. orbital period by discovery method
- **Timeline**: count of discoveries by year, colored by method
- **Size classification**: histogram of planet types
- **Star-planet relationships**: stellar temperature vs. planet radius
- **Interactive 3D**: RA/Dec scatter with size encoding

---

## License

Public domain — U.S. government data.