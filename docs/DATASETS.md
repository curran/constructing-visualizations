# Advanced Data Visualization Curricula
## A Curated Bundle of Public Datasets and Pedagogical Methodologies

The pedagogical efficacy of a data visualization curriculum relies fundamentally on the semantic richness, structural diversity, and topological complexity of the datasets it employs. Teaching graphical perception—mapping data attributes to visual channels such as position, length, area, color, and angle—requires datasets that naturally exhibit the characteristics suited to each encoding. As a curriculum progresses from fundamental charts (bar charts, scatter plots) to complex compositional and relational graphics (stream graphs, trees, pie-on-map projections, node-link diagrams), the underlying data must possess the requisite dimensionality and temporal depth.

Critically, the curation must transcend trivial, artificially clean, or analytically exhausted data—most notably the overused character co-occurrence network of Victor Hugo's *Les Misérables*. The optimal sources expose real-world phenomena: demographic momentum, socioeconomic stratification, the temporal rhythms of human behavior, the geospatial distribution of belief, the hyper-accelerated economics of artificial intelligence, and the evolutionary topology of technical and transportation networks.

---

## Bottom Line: The Recommended Bundle

If you were locking in a course bundle today, the strongest course-ready set consists of **seven core public sources**, chosen for being official or highly durable, topically varied, and structured enough to cover nearly every chart type without forcing students into excessive data wrangling.

| Role | Primary Source | Notes |
|------|---------------|-------|
| **Global time-series backbone** | UN World Population Prospects 2024 | Estimates 1950→present, projections to 2100, 237 countries/areas |
| **Hierarchy layer** | UN M49 Standard | World → Region → Sub-region → Country |
| **U.S. county demographics** | Census ACS 5-Year Estimates | Joined to Census cartographic boundary files; PEP as freshness supplement |
| **Labor market** | BLS LAUS + BLS QCEW | Time series + industrial structure, both keyed to county |
| **Religion (pie-on-map)** | Pew Global Religious Composition (2010 & 2020) | Country-level, 201 territories; RLS optional U.S. add-on |
| **AI economics** | OpenRouter Models API | Teach from a *frozen, dated snapshot* for reproducibility |
| **Node-link / flows** | BTS Origin–Destination Survey + airport points | Airports as nodes, routes as weighted edges |

> This set is broad without being random. It gives students official global demography, official U.S. county demographics, official labor data, a well-scoped religion dataset, a current AI-market dataset, and a non-generic real network—demonstrating that chart forms are not stylistic choices but emerge from distinct data structures: **time series, hierarchies, compositions, geographies, and graphs.**

---

## 1. Global Demographic Dynamics — UN Population Estimates

To teach line charts, area charts, multi-line and stacked area charts, and hierarchical trees, the **2024 Revision of World Population Prospects (WPP)**—prepared by the UN Population Division—serves as the definitive backbone. This twenty-eighth edition presents estimates from 1950 to the present across **237 countries or areas**, underpinned by 1,910 national censuses, vital registration systems, and 3,189 representative sample surveys, with probabilistic projections extending to 2100.

Because it is a long, tidy panel dataset with a stable country key, it becomes a reliable "spine" students can reuse across multiple chapters.

### Temporal Visualizations: Line, Area, and Stacked Area Charts

A major methodological enhancement makes WPP uniquely suited for high-resolution time-series work: estimates are now presented in **one-year intervals** of age and time, replacing the prior five-year intervals. Data is available in structured CSV (by five-year age groups and single ages) alongside specific indicators such as the adolescent population (`DM_POP_ADLCNT`).

Analytically, these encodings reveal **demographic momentum**: a global line chart demonstrates that population increase through mid-century is driven by past growth, persisting even as women today bear roughly one child fewer than around 1990. Extending to stacked area charts forces students to group, pivot, and stack by region or income group—exposing a profound geopolitical shift: the plateau and decline of Eastern Asia and Eastern Europe against the expanding base of Sub-Saharan Africa, and the reality that one in four people now lives in a country whose population has already peaked.

### Hierarchical Topologies: Tree Visualizations

For trees, the best companion is the **UN M49 standard**, which provides the official statistical hierarchy with stable numeric and ISO codes. Because it meshes with the WPP file, students can build a hierarchy and immediately attach population measures to each node.

| Hierarchical Level | Conceptual Node | Example Child Nodes |
|---|---|---|
| **Root** | Global Entity | World |
| **Branch (L1)** | Continent / Major Area | Asia, Europe, Africa, Oceania, Latin America, Northern America |
| **Branch (L2)** | Sub-Region | Asia $\rightarrow$ Southern, Western, South-Eastern, Eastern, Central Asia |
| **Leaf (L3)** | Country / Territory | Southern Asia $\rightarrow$ Afghanistan, Bangladesh, Bhutan, India, Iran, Maldives, Nepal, Pakistan, Sri Lanka |

Parsing flat CSV metadata into nested JSON teaches recursive data structures, and the resulting tree footprint provides pre-attentive insight into political fragmentation. The Caribbean branch, for instance, forms a dense cluster of island nations, while Northern America terminates sparsely into just five entities (Bermuda, Canada, Greenland, Saint Pierre and Miquelon, the United States).

---

## 2. Geospatial Compositions of Ideology — Pew Religion Data

To teach the integration of compositional data with geospatial coordinates—**pie charts on a map**—Pew Research Center provides the definitive material. A key refinement: for map-ready work, the cleanest source is **not** the U.S. microdata but Pew's **Dataset of Global Religious Composition Estimates for 2010 and 2020**.

<details>
<summary><strong>Why the global file over the U.S. Religious Landscape Study (RLS)</strong></summary>

The global composition file gives country-level estimates for **seven religion categories** across **201 countries and territories**, covering 99.98% of the world's population, and is explicitly built for download and secondary analysis. A February 2026 update added a religious diversity index, level, and rank, enabling clean choropleths and ranked bars.

By contrast, the **2023–24 RLS** (a large U.S. survey, ~36,908 respondents collected via address-based sampling between July 2023 and March 2024) releases a **public-use file that excludes geography** to protect confidentiality; geographic identifiers are reserved for a future restricted-use version. Pew's interactive RLS site still provides state, metro, region, and national outputs, so the RLS remains a valuable **optional U.S. survey add-on**—but for a downloadable, map-ready geography file, the global dataset is the better primary choice.

</details>

### Compositional Mapping: Pie Charts on Geographic Projections

Standard choropleths display only a single variable per polygon. Accurately mapping religious diversity requires displaying internal composition within each boundary simultaneously—placing pie charts at geographic centroids is the optimal solution.

A critical engineering challenge: the radius of each pie should encode absolute population, requiring the relationship

$$r = \sqrt{\frac{A}{\pi}}$$

so that **area**, not radius, scales linearly with population. Dense regions (the American Northeast; or, globally, Western Europe) then suffer severe overlap and occlusion, forcing advanced techniques such as **D3.js force-directed collision detection** to repel overlapping marks, or programmatic leader lines that displace charts into open ocean while preserving geographic association.

> **Course-design judgment:** With the global file, use pie symbols on a *selected subset of countries or a regional view* rather than all 201 at once—pie marks clutter a full world map quickly. The data are best suited to comparison.

#### State Religious Metrics (RLS, if used)

| Metric | Survey Construct | Insight Derived |
|---|---|---|
| Importance of Religion | % who say religion is very important | Internalized subjective value of ideological frameworks |
| Religious Attendance | % attending services ≥ monthly | Active communal participation and institutional strength |
| Frequency of Prayer | % who pray daily | Private, habitual practice distinct from attendance |
| Belief in God | % believing with absolute certainty | Fundamental metaphysical conviction across denominations |

---

## 3. High-Resolution Socioeconomics — U.S. County-Level Demographics

For granular geographic mapping, spatial autocorrelation, and multivariate correlation, the U.S. comprises **over 3,100 counties and equivalents**—the optimal granularity for dense choropleths and high-volume scatter plots.

### Best Default Source: ACS 5-Year Estimates

The recommended workhorse is the **American Community Survey 5-year estimates**, which cover social, economic, housing, and demographic characteristics and are available at the county level. One source supports many questions—age structure, race/ethnicity, educational attainment, poverty, commuting, language, housing tenure—so students reuse the same geography and access pattern across the course.

For mapping, pair ACS with **Census cartographic boundary files** (simplified for small-scale thematic mapping: fewer vertices, faster rendering), reserving the detailed **TIGER/Line** files for full GIS workflows. Keep the **Population Estimates Program (PEP)** in reserve for fresh annual county population change.

> The USDA ERS county datasets (poverty, education, unemployment, income) remain a viable, pre-normalized alternative; like ACS, they are keyed by **FIPS codes**, allowing seamless binding of statistical CSVs to TopoJSON/GeoJSON boundaries.

### Geospatial Intensity: Constructing Choropleth Maps

A poverty choropleth requires reckoning with classification algorithms—**Jenks natural breaks, quantiles, equal interval**—and how binning alters the visual narrative. A sequential color scale exposes the non-random, clustered nature of economic hardship along entrenched bands: the Mississippi Delta, Appalachia, and Native American reservations in the Dakotas.

This is also the ideal vehicle for teaching the **Modifiable Areal Unit Problem (MAUP)**: vast, sparsely populated Western counties dominate the map's geometry and inflate their perceptual importance, while tiny, densely populated urban counties recede into microscopic pixels—distorting the actual human distribution.

### Multivariate Correlation: Overplotting in Scatter Plots

The same county data anchors dense scatter plots—educational attainment ($x$) against median income or unemployment ($y$). With 3,100+ nodes, students must mitigate overplotting via **alpha blending**, **2D density contours**, or **jitter algorithms**.

The result shows a strong, heteroskedastic positive correlation, but the analytical value lies in the outliers: counties with low attainment yet exceptionally high incomes often map to resource-extraction economies (the oil-and-gas boomtowns of North Dakota)—a lesson in how localized industrial shocks perturb macroeconomic trends.

| County Metric | Source / Program | Visualization Utility |
|---|---|---|
| Poverty Rate | Census SAIPE | Choropleth color encoding; systemic regional distress |
| Educational Attainment | ACS / USDA ERS | Scatter x-axis; multi-generational human capital |
| Unemployment Rate | BLS LAUS | Scatter y-axis; acute economic volatility |
| Median Household Income | Census SAIPE | Bubble radius scaling; absolute localized purchasing power |

---

## 4. The Temporal Rhythms of Human Behavior — Bureau of Labor Statistics

### Recommended BLS Strategy: Two Programs, Not One

For a clean BLS pipeline, pair two programs:

- **Local Area Unemployment Statistics (LAUS)** for time series — monthly and annual labor force, employment, and unemployment estimates for **counties**, spanning decades. Ideal for line charts, multi-line charts, animated maps, slope views, and small multiples, and it joins easily to ACS county demographics.
- **Quarterly Census of Employment and Wages (QCEW)** for structure — covering **>95% of U.S. jobs** at county/state/national levels, broken out by **industry (NAICS)**. Ideal for bar charts, grouped bars, stacked area, stream graphs, and industry composition views.

> Pedagogically, LAUS gives the **macroeconomic pulse** of a place over time; QCEW gives its **industrial anatomy**. Students learn one geography key and see how different chart types answer different questions about the same counties.

### The Crown Jewel: American Time Use Survey (ATUS)

For visualizing **fluid, continuous part-to-whole relationships over a timeline**, the ATUS is unparalleled. This continuous federal survey captures daily activity diaries—respondents log everything they do over a 24-hour period in precise intervals.

<details>
<summary><strong>Microdata complexity and event logging</strong></summary>

The raw CSV files (Respondent, Roster, Activity, Activity Summary) amount to hundreds of megabytes of normalized relational data spanning 2003 to the present. The Activity file records precise start/stop times (`tustarttim`, `tustoptime`) for every granular activity, classified by a multi-tiered lexicon—e.g., code `120303` (television), `070102` (pumping gas), `180807` (commuting to the vet), `130121` (calf-roping or cattle-riding).

</details>

#### Continuous Flow: Engineering Stream Graphs

Transforming this event log into a smooth stream graph is a rigorous exercise in data engineering. Timestamps must be normalized into **minute-of-day integer epochs ($0$–$1439$)** via Python/Pandas or R, with edge-case logic for activities crossing midnight. Millions of records are then aggregated into population proportions per activity tier (Work, Sleep, Leisure, Childcare) per minute, and stacked symmetrically around a baseline using **Wiggle, Silhouette, or Baseline** layouts.

The result pulsates with the rhythm of civilization: a swell of "Sleep" at the edges yields to towering daytime peaks of "Work" and "Education," with thin vertical slivers of "Eating and Drinking" at noon and 6:00 PM. Filtering by demographic reveals the **"sandwich generation"**: at 25, individuals average 275 minutes alone or 199 with coworkers; by 35, those bands narrow drastically, replaced by sustained childcare and partner-care exceeding 7.5 hours a day. The stream graph maps the temporal burden of adulthood—an extraordinary lesson in narrative visualization.

---

## 5. The Economics of Artificial Intelligence — LLM Telemetry

For visualizing hyper-modern markets and multidimensional pricing, **OpenRouter's Models API** (`https://openrouter.ai/api/v1/models`) yields real-time JSON detailing pricing, architectural limits, and capabilities across hundreds of LLMs. It is valuable precisely because it is more than a price table.

> **Reproducibility recommendation:** Because OpenRouter documents live pricing and possible model deprecations, take a **dated snapshot** of the API output at the start of the course so exercises remain reproducible even if the market shifts mid-semester.

### Multidimensional Mapping: Logarithmic Scatter Plots

Each model object exposes an `id`, an architecture `modality` (e.g., `text->text`), a `context_length`, and a nested `pricing` object (cost per prompt/completion token), plus throughput and latency.

This forces non-linear scales. Context lengths range from 4,096 tokens to windows exceeding 2,000,000; pricing spans from free open weights to several dollars per million tokens. Plotting `context_length` ($x$) against `pricing` ($y$) **strictly requires logarithmic scales** (`d3.scaleLog()`) to prevent collapse near the origin.

| API Field | Type | D3.js Mapping |
|---|---|---|
| `id` / `name` | String | SVG tooltips for identification |
| `context_length` | Number | x-axis; requires `scaleLog()` |
| `pricing.prompt` | String (Float) | y-axis; requires `scaleLog()` |
| `architecture.modality` | String | `scaleOrdinal()` to hex colors (text vs. multimodal) |

Clustering reveals distinct market tiers: a dense, competitive floor of open-weight models (Llama, Mistral, Qwen derivatives) near zero marginal cost, against a sparse upper frontier of proprietary reasoning models. Mapping intelligence benchmarks to marker radius ($z$-axis) exposes a counterintuitive **value ratio**—smaller distilled models often dominate intelligence-per-dollar—illustrating the deflationary economics of neural architectures. Accompanying bar charts can rank models by usage volume.

---

## 6. Complex Systems and Topology — Node-Link Diagrams

To retire the analytically exhausted *Les Misérables* default, the recommended primary network is a **real, current, geographically meaningful** one.

### Primary: BTS Origin–Destination Survey

The **Bureau of Transportation Statistics Origin and Destination Survey** is the top recommendation. The current OD program's **DB1C** file is a monthly 40% sample of airline tickets (starting July 2025), with **market** and **segment** files containing origin, destination, carrier, and fare data. Paired with the BTS **airports point dataset**, you immediately have:

- **Nodes:** airports
- **Edges:** routes / passenger flows
- **Weights:** passengers or fares

This supports node-link diagrams, route maps, **edge bundling**, geographic flow maps, and filtering by carrier or airport size—substantive, official DOT/BTS data appropriate for university work.

<details>
<summary><strong>Backup network: ACS County-to-County Migration Flows</strong></summary>

If you prefer to keep the network unit inside the Census/BLS ecosystem, the Census Bureau's **county-to-county migration flows** (and state-to-county flows for newer ACS 5-year releases) create a compelling "people movement" network that joins back to county demographics. Less visually intuitive than airline routes at first glance, but thematically coherent. BTS flights remain the cleaner first choice for a general course.

</details>

<details>
<summary><strong>Optional engagement datasets: Star Wars & Programming Languages</strong></summary>

**Star Wars Social Network** (Evelina Gabasova): JSON files where nodes are characters and edges are weighted by shared-scene interactions (`INTERACTX` per episode). A force-directed layout—Barnes-Hut approximation, with electrostatic repulsion $F = \frac{k}{d^2}$ and spring-like edges—surfaces narrative structure: Anakin and Obi-Wan form dense prequel hubs; Luke, Leia, and Han dominate the original trilogy.

**Programming Languages Influence Network** (Freebase/Wikidata): a directed JSON graph of 1,180+ languages, exhibiting scale-free, power-law properties. Root nodes (C, Lisp, Smalltalk) have massive out-degrees; most languages are terminal leaves. Color-coding by paradigm—Object-oriented (188), Functional (130), Imperative (118), Logic (20)—visualizes the historical convergence of multi-paradigm languages.

</details>

---

## How the Final Set Covers Your Textbook

| Chart Type | Recommended Dataset(s) |
|---|---|
| **Line / area / multi-line** | UN WPP (population trajectories); LAUS (county unemployment); QCEW (industry employment) |
| **Stacked area / stream graphs** | UN WPP aggregated to M49 regions; QCEW by sector; ATUS for behavioral flow |
| **Bar / grouped bars** | ACS county demographics; QCEW industry profiles; Pew global religion |
| **Scatter plots** | ACS × LAUS/QCEW (socioeconomics); OpenRouter (price vs. capability) |
| **Choropleths** | ACS or LAUS/QCEW + Census cartographic boundaries; Pew or UN + ISO/M49 boundaries |
| **Pie charts on a map** | Pew global religion (regional subset) |
| **Trees / hierarchies** | UN M49 (canonical); QCEW industry-by-geography (secondary treemap) |
| **Node-link diagrams** | BTS OD40/DB1C + airports (primary); ACS migration flows (backup) |

---

## Architectural Imperatives for High-Performance Client-Side Rendering

Curating massive datasets—multi-megabyte ATUS microdata, thousands of county polygons—introduces a secondary requirement: rendering and interacting without degrading frame rate. When linked dashboards use **crossfiltering** (a brush in one chart filters all others), synchronously iterating over hundreds of thousands of JSON objects on the main thread induces catastrophic lag below the 60 fps threshold.

The architecture should escalate through a **"Crossfiltering Stepladder"**:

1. **Web Worker Offloading.** Move dataset scans off the main UI thread into a dedicated worker. Use **single-flight scheduling**—process only the latest requested state—to avoid backing up on rapid interaction.

2. **Columnar Storage and Bitsets.** Shred data into flat typed arrays (`Float64Array`, `Uint32Array`) on load. Execute multi-dimension filters via hardware-level bitwise `AND` operations against a **bitset mask**, shifting complexity from $O(N)$ toward $O(\log N + K)$ when combined with binary search on sorted indexes.

3. **The URL as Source of Truth.** Serialize the full dashboard state—selected county, brushed interval, highlighted demographic—into the URL via `URLSearchParams`. This unidirectional flow makes exploratory states deep-linkable, shareable, and navigable via browser history without losing analytical context.

---

## Conclusion

The curation of datasets is not an administrative prerequisite; it is the determinant of analytical depth. By deploying **UN WPP and M49** for temporal and hierarchical structure, the **Pew global religion file** for compositional mapping, **ACS county data with BLS LAUS and QCEW** for spatial and multivariate analysis, the **ATUS diaries** for stream graphs, the **OpenRouter API** for logarithmic multidimensional variance, and **BTS flight networks** for relational topology, the framework transcends basic chart construction. It compels rigorous engagement with data normalization, non-linear scaling, cognitive perception limits, and the optimized architectures required to translate multidimensional reality into coherent, interactive, performant visual narratives—while ensuring every source is official, durable, and reproducible.
