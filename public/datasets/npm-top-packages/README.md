# npm-top-10000

**Top 10,000 NPM packages ranked by monthly downloads, with full metadata.**

A CSV dataset of the most-downloaded packages on the npm public registry, built by
combining the npm search API (for candidate discovery) with the package metadata
endpoint (for full detail). Each row contains 15 columns covering version info,
license, repository, maintainers, dependencies, timestamps, and more.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `npm-top-10000.csv` | ~6.7 MB | 9,999 packages + 1 header |

Generated **June 2026**. The file lives alongside this README in the `npm-top/` directory.

---

## Schema (15 columns)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `name` | string | Package name (may include npm scope) | `semver`, `@smithy/types` |
| 2 | `downloads_last_month` | integer | Downloads in the trailing 30‑day window | `3249783700` (3.2B) |
| 3 | `latest` | string | Latest version string from `dist-tags.latest` | `7.8.5`, `4.4.3` |
| 4 | `description` | string | Short description from package metadata | `The semantic version parser used by npm.` |
| 5 | `license` | string | SPDX license identifier | `ISC`, `MIT`, `Apache-2.0`, `BlueOak-1.0.0` |
| 6 | `homepage` | string | URL to the project homepage / website | `https://github.com/npm/node-semver#readme` |
| 7 | `repository` | string | VCS URL (Git, etc.) | `git+https://github.com/npm/node-semver.git` |
| 8 | `keywords` | JSON array | Search keywords, stringified | `["semver","version","semantic"]` |
| 9 | `maintainers` | JSON array | Maintainer usernames, stringified | `["sindresorhus"]` |
| 10 | `created` | datetime | ISO 8601 timestamp of first publication | `2011-02-12T00:20:25.690Z` |
| 11 | `modified` | datetime | ISO 8601 timestamp of last modification | `2026-06-19T18:32:49.353Z` |
| 12 | `versions_count` | integer | Number of published versions | `119` |
| 13 | `dependencies` | JSON object | Runtime dependencies (`name → semver`) | `{"ms":"^2.1.3"}` |
| 14 | `devDependencies` | JSON object | Dev dependencies (`name → semver`) | `{"xo":"^0.58.0","ava":"^6.1.3"}` |
| 15 | `peerDependencies` | JSON object | Peer dependencies (`name → semver`) | `{}` |

---

## Sample Rows

| name | downloads_last_month | latest | license | versions_count |
|---|---|---|---|---|
| semver | 3,249,783,700 | 7.8.5 | ISC | 119 |
| debug | 2,621,850,872 | 4.4.3 | MIT | 77 |
| ansi-styles | 2,612,223,055 | 6.2.3 | MIT | 28 |
| lru-cache | 1,977,271,343 | 11.5.1 | BlueOak-1.0.0 | 98 |
| commander | 1,742,454,563 | 15.0.0 | MIT | 89 |
| glob | 1,522,751,733 | 13.0.6 | BlueOak-1.0.0 | 49 |
| readable-stream | 1,264,271,036 | 4.7.0 | MIT | 57 |
| axios | 480,001,294 | 1.9.0 | MIT | 96 |
| react-dom | 537,122,894 | 19.1.0 | MIT | 246 |
| next | 163,356,733 | 15.3.1 | MIT | 845 |
| vue | 53,710,851 | 3.5.13 | MIT | 423 |

---

## Columns you may want to exclude

These columns contain long JSON strings that add bulk but offer limited
analytical value for most use cases:

| Column | Reason | Approx. size per row |
|---|---|---|
| `dependencies` | JSON object with many entries for popular packages; often empty | 10–500+ chars |
| `devDependencies` | Same shape and bulk as `dependencies` | 10–500+ chars |
| `peerDependencies` | Usually empty or very short, but zero marginal value once you know it's empty | 2–200 chars |
| `keywords` | JSON array; useful for search but large when many keywords exist | 10–300+ chars |
| `maintainers` | JSON array; useful but adds bulk for packages with large teams | 10–200+ chars |

**Recommendation**: if you only need lightweight analysis, keep
`name, downloads_last_month, latest, description, license, versions_count, created, modified`.

---

## Methodology

### Phase 1 — Candidate discovery (`npm search API`)

The npm registry exposes a search endpoint at
`/-/v1/search` (Elasticsearch‑backed) that returns results ranked by a
combination of text relevance, popularity, quality, and maintenance.

To cover as many packages as possible, the script iterates through **50 broad
English and programming terms** (e.g. `"the"`, `"module"`, `"api"`, `"config"`,
`"plugin"`). For each term it paginates through up to 40 pages (250 results each,
1 req / 200 ms) and collects unique package names together with their
**monthly download count** (included in the search response).

Candidates are sorted by downloads descending. The top 10,000 unique packages
become the candidate set.

### Phase 2 — Metadata enrichment (`registry.npmjs.org/{package}`)

For each candidate, the script fetches the full package document from
`https://registry.npmjs.org/{name}`. From the response it extracts:

- `dist-tags.latest` → `latest`
- `description`, `license`, `homepage`, `repository`
- `keywords`, `maintainers`
- `time.created`, `time.modified`
- keys of `versions` → `versions_count`
- `versions[latest].dependencies / devDependencies / peerDependencies`

Requests are throttled to ~50 in‑flight. Newline and carriage‑return
characters in description fields are replaced with spaces to ensure valid CSV.

### Known limitations

| Limitation | Impact |
|---|---|
| Search API text‑relevance bias | Packages whose name/description strongly matches few broad terms are less likely to appear. Some very popular packages (e.g. `react`, `lodash`, `express`) are missing from the final dataset. |
| Download counts from search API (Phase 1) vs. download API | The monthly download value embedded in search results can differ slightly from the dedicated downloads endpoint. |
| Rate limiting | The npm search and registry APIs enforce per‑IP rate limits (~10 req/s). The script adds 200–5000 ms delays when it receives HTTP 429 responses. |
| Checkpoint / resume | Phase 1 saves a `candidates.json` checkpoint file. If the script is killed during Phase 2, you can re‑run and it will skip Phase 1. |

**For a truly exact top 10,000 by downloads**, you would need to enumerate all
~4.1 million packages (via the CouchDB `_all_docs` view), query download counts
for every one (bulk API, ~100 per request), then sort. That approach is
rate‑limited to roughly 1,000 packages/second and would take ~70 minutes of wall
time.

---

## Recreating the dataset

### Prerequisites

- Node.js ≥ 18 (built‑in `fetch`)
- npm

### Steps

```bash
# 1. Create a fresh project directory
mkdir npm-top-fresh && cd npm-top-fresh

# 2. Initialize and install dependencies
npm init -y
npm install csv-stringify p-limit

# 3. Copy the script
#    (Use the full script from this repo's npm-top-10000.mjs)
cp /path/to/npm-top-10000.mjs .

# 4. Run
node npm-top-10000.mjs

# 5. The CSV will appear as npm-top-10000.csv
#    Intermediate candidates are saved in candidates.json for resume.
```

### Script files in this repo

| File | Purpose |
|---|---|
| `npm-top-10000.mjs` | Full pipeline: Phase 1 (search) + Phase 2 (metadata). Checkpoints to `candidates.json`. |
| `resume.mjs` | Phase 2 only: reads `candidates.json`, fetches metadata, writes CSV. Useful if Phase 2 was interrupted. |

### Expected runtime

- **Phase 1**: ~3–5 minutes (~200 search API calls with 200 ms delays)
- **Phase 2**: ~8–12 minutes (10,000 metadata fetches at 50 concurrency)
- **Total**: ~15 minutes (varies with network latency and rate‑limit backoffs)

---

## API Endpoints used

| Endpoint | Purpose |
|---|---|
| `GET /-/v1/search?text=...&size=250&from=N&popularity=1.0` | Search packages by text, sorted by popularity. Returns monthly download count per result. |
| `GET /{package}` | Full package metadata document (versions, time, maintainers, etc.). |
| `GET /downloads/point/last-month/{package}` | Download count for the trailing 30 days (not used directly; download data comes from search results). |

All endpoints are at `https://registry.npmjs.org` except the download API at
`https://api.npmjs.org`.

---

## License

The data in this CSV is derived from the public npm registry. Package metadata
is published under each package's own license. This dataset is provided as-is
for research and educational purposes.