# Palmer Penguins

**Size measurements for 344 penguins observed on three islands in the Palmer
Archipelago, Antarctica — the modern alternative to the iris dataset.**

The Palmer Penguins dataset contains morphological measurements (bill length,
bill depth, flipper length, body mass), species, island, sex, and study year
for 344 individual adult penguins. It was collected by Dr. Kristen Gorman at
Palmer Station, Antarctica as part of the Long Term Ecological Research (LTER)
program. It is a popular, small, "tidy" dataset for teaching data exploration
and visualization, designed as an alternative to the classic iris dataset.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `penguins.csv` | ~15 KB | 344 rows × 8 columns |

---

## Schema (8 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `species` | string | Penguin species | `Adelie` |
| 2 | `island` | string | Island in the Palmer Archipelago | `Torgersen` |
| 3 | `bill_length_mm` | number | Culmen (bill) length (mm) | `39.1` |
| 4 | `bill_depth_mm` | number | Culmen (bill) depth (mm) | `18.7` |
| 5 | `flipper_length_mm` | number | Flipper length (mm) | `181` |
| 6 | `body_mass_g` | number | Body mass (g) | `3750` |
| 7 | `sex` | string | Penguin sex (`male`, `female`, or `NA`) | `male` |
| 8 | `year` | number | Study year (2007–2009) | `2007` |

### Value Distribution

| Column | Values |
|---|---|
| `species` | Adelie (152), Gentoo (124), Chinstrap (68) |
| `island` | Biscoe (168), Dream (124), Torgersen (52) |
| `sex` | male (168), female (165), NA (11) |
| `year` | 2007 (110), 2008 (114), 2009 (120) |
| `bill_length_mm` | 32.1 – 59.6 |
| `bill_depth_mm` | 13.1 – 21.5 |
| `flipper_length_mm` | 172 – 231 |
| `body_mass_g` | 2,700 – 6,300 |

**Note:** 2 rows have `NA` for all four measurement columns (missing
measurements). 11 rows have `NA` for sex.

---

## Methodology

### Source

Downloaded from the canonical `palmerpenguins` R package repository:
```
https://github.com/allisonhorst/palmerpenguins
https://raw.githubusercontent.com/allisonhorst/palmerpenguins/main/inst/extdata/penguins.csv
```

Also available from:
- CRAN package `palmerpenguins` (data in `inst/extdata/`)
- Zenodo archive (DOI: 10.5281/zenodo.3960218)
- Palmer Station LTER (https://pallter.marine.rutgers.edu/)

### Processing Steps

1. **Download** `penguins.csv` from the GitHub raw URL above.
2. **Validate** the header row and column count (8 columns) for every row.
3. **Preserve** the file byte-for-byte — the canonical tidy file is already
   clean (LF line endings, no quoting issues).
4. **Report** summary statistics (species, island, sex counts, missing data).

The repository also contains `penguins_raw.csv` (344 rows × 17 columns) with
original field measurements, study metadata, and blood isotope ratios; this
package ships the tidy 8-column version, which is the standard form used in
visualization examples.

### Generation Script

Run `node fetch-palmerpenguins.mjs` to regenerate the dataset. No npm
dependencies required — uses only Node.js built-in `fetch` (≥ 18).

### Prerequisites

- Node.js ≥ 18 (built-in `fetch`)

### Expected Runtime

~2 seconds (single small file download).

---

## Usage Ideas

- **Scatter plot**: flipper length vs. body mass, colored by species
- **Histograms**: bill length distribution per species
- **Faceted plots**: bill length vs. depth by island or sex
- **Box plots**: body mass by species
- **Course use**: color scales, categorical encodings, missing-data handling
- **Classification demo**: predict species from bill/flipper measurements

---

## License

CC0 — public domain dedication (Dr. Kristen Gorman & Palmer Station LTER;
packaged by Allison Horst).