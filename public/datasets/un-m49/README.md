# UN M49 Country Classification

**Standard hierarchical classification of countries and regions (UN M49 standard).**

The UN M49 classification is a standard for area codes used by the United
Nations for statistical purposes. This dataset includes the full hierarchy
from world → region → sub-region → intermediate region → country, with M49
numeric codes and ISO Alpha-3 codes for tree visualization and map joins.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `un_m49_hierarchy.csv` | 18.5 KB | 279 rows × 8 columns |

---

## Schema (8 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `name` | string | Entity name | `India` |
| 2 | `level` | number | 0=World, 1=Region, 2=Sub-region, 3=Intermediate, 4=Country | `4` |
| 3 | `m49_code` | string | M49 numeric code | `356` |
| 4 | `iso_alpha3` | string | ISO Alpha-3 code (countries only) | `IND` |
| 5 | `parent_name` | string | Direct parent entity name | `Southern Asia` |
| 6 | `parent_m49` | string | Direct parent M49 code | `034` |
| 7 | `region_name` | string | Top-level region name | `Asia` |
| 8 | `subregion_name` | string | Sub-region name | `Southern Asia` |

---

## Methodology

### Source
```
https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv
```

The direct UN Statistics Division CSV (
`https://unstats.un.org/unsd/methodology/m49/data/m49.csv`) and the
`UN-M49/UN-M49` GitHub repo are no longer accessible (404).
[`lukes/ISO-3166-Countries-with-Regional-Codes`](https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes)
is the best-maintained curated alternative, used here.

### Processing Steps

1. **Download CSV** from the lukes/ISO-3166 repository.
2. **Parse** each country row: extract region, sub-region, intermediate region
   metadata with M49 codes.
3. **Build hierarchy tree**:
   - Level 0: World (M49 `001`)
   - Level 1: 5 regions (Africa, Americas, Asia, Europe, Oceania)
   - Level 2: 17 sub-regions
   - Level 3: 7 intermediate regions
   - Level 4: 249 countries/areas
4. **Assign parents**: each entity gains `parent_name` and `parent_m49` for its
   direct ancestor.
5. **Write CSV** with explicit parent structure (279 rows total).

### Hierarchy Coverage

| Level | Count | Examples |
|---|---|---|
| 0 — World | 1 | World |
| 1 — Region | 5 | Asia, Africa, Europe, Americas, Oceania |
| 2 — Sub-region | 17 | Southern Asia, Sub-Saharan Africa, Western Europe |
| 3 — Intermediate | 7 | Caribbean, Middle Africa, South America |
| 4 — Country | 249 | India, Brazil, Angola, France, Australia |

### Edge Cases

- **Antarctica** (010) and **Taiwan** (158) have no region/sub-region metadata;
  their parent is set to `World` (001) with empty region/subregion fields.
- **Countries with commas in names** (e.g. "Bolivia, Plurinational State of") are
  properly CSV-quoted.

### Prerequisites

- Node.js ≥ 18

### Expected Runtime

~5 seconds (download + transform).

---

## Usage Ideas

- **Tree diagram**: interactive exploration of the UN geographic hierarchy
- **Sunburst**: hierarchical geographic classification
- **Map metadata**: join with other datasets that use M49 or ISO3 codes
- **Course use**: linked views — select region, highlight countries on map

---

## License

© United Nations. Freely available for research and educational use.