# Constructing Visualizations — Full Updated Course Roadmap

The course now has a fairly coherent progression:

**marks → interaction → aggregation → distributions → cross-filtering → composition → time → geography → flows/networks → hierarchy → perceptual encoding → scalable computation → exploratory systems → embeddings → focus/context → integration**

The recurring implementation pattern is:

**data → transformation → encoding → interaction → selection/filtering → derived data → coordinated views → optimization**

A good production rule remains **two core examples per chapter/week**, with additional examples when they naturally extend the same implementation. Several weeks below intentionally contain more because they form mini-series that can spill across chapters if necessary.

---

# Chapter 5 — Finish Penguins: interaction, aggregation, and the first coordinated view

**Core idea:** finish the current scatter-plot sequence, introduce aggregation, then immediately connect two different views of the same records.

## Example 5.1 — Penguins: color + interactive legend

Continue directly from the current Palmer Penguins scatter plot.

Add:

* species encoded by color
* categorical color scale
* legend
* hover/highlight through the legend
* optionally click the legend to filter or toggle species

Concepts:

* categorical encoding
* legends as visualization components
* interaction through a legend
* coordinated highlighting

This completes the visual-encoding side of the initial scatter-plot sequence.

---

## Example 5.2 — Configurable scatter plot

Add controls that let students choose the quantitative attributes mapped to X and Y.

Candidate attributes:

* bill length
* bill depth
* flipper length
* body mass

The visualization becomes parameterized:

`dataset + xAttribute + yAttribute → scatter plot`

Concepts:

* UI controls
* controlled React state
* dynamic scales
* reusable visualization components
* treating a visualization as an analytical instrument rather than a fixed picture

---

## Example 5.3 — Species bar chart

Shift from one mark per row to aggregation.

Transform:

`penguin records`

into:

`species → count`

Then construct the first basic bar chart.

Concepts:

* grouping
* counting
* aggregation
* derived data
* band scales
* quantitative scales
* axes

### Extension

Allow the measure to change:

* count
* mean body mass
* mean flipper length
* mean bill length

That makes the transformation pipeline explicit:

`rows → group → aggregate → encode`

---

## Example 5.4 — Scatter plot + bar chart

Put the scatter plot and species bar chart side by side.

Initially both consume the full Penguins dataset.

This establishes:

> Multiple visualizations can be different projections of the same underlying records.

Introduce:

* shared data
* view-specific transformations
* multi-view composition
* common React state

---

## Example 5.5 — Brush scatter → aggregate bars

Add rectangular brushing to the scatter plot.

The selected rows feed the species aggregation.

Architecture:

`Penguins`

→ `scatter plot`

→ `brush selection`

→ `selected penguins`

→ `group by species`

→ `bar chart`

This is the first real coordinated-view visualization, before formally introducing generalized cross-filtering.

**Primary dataset:** Palmer Penguins.

**Potential alternatives:** automobiles, Iris, Gapminder, though Penguins should remain the canonical example because the class already knows it.

---

# Chapter 6 — Histograms, small multiples, and cross-filtering

This becomes the first substantial exploration of **distributions and coordinated filtering**.

## Example 6.1 — Single histogram

Start with one quantitative Penguins attribute, such as body mass.

Introduce:

* continuous distributions
* bins
* thresholds
* counts
* bin boundaries
* `d3.bin`
* the effect of changing bin count

A useful conceptual contrast is:

**bar chart**

`existing categories → values`

versus

**histogram**

`continuous values → manufactured intervals → counts`

---

## Example 6.2 — Small multiples of histograms

Build histograms for several Penguins fields:

* body mass
* flipper length
* bill length
* bill depth

Use the same histogram component repeatedly.

Concepts:

* small multiples
* repeated components
* multiple projections of one dataset
* reusable visualization architecture

The system now starts resembling a lightweight exploratory-data-analysis interface.

---

## Example 6.3 — Brush one histogram

Add an interval brush.

For example:

`4,000g ≤ body mass ≤ 5,000g`

Translate the brush into a data predicate.

Architecture:

`brush pixels`

→ `scale.invert`

→ `numeric interval`

→ `predicate`

→ `filtered rows`

This establishes the fundamental abstraction:

> An interaction produces a data-space filter.

---

## Example 6.4 — Cross-filtered histogram small multiples

Make every histogram brushable.

A body-mass filter alters the visible distributions of:

* bill length
* bill depth
* flipper length

Then allow several filters simultaneously.

For example:

`body mass = 4000–5000`

AND

`bill length = 45–55`

The architecture becomes:

`filter state`

→ `filtered records`

→ `view-specific binning`

→ `histograms`

This is where to formally introduce **cross-filtering as an architectural pattern**.

A useful conceptual structure:

```text
raw rows
   ↓
active filters
   ↓
filtered rows
   ↓
┌────────┬────────┬────────┬────────┐
mass     bill     depth    flipper
bins     bins     bins     bins
```

---

## Example 6.5 — Filtered records table

Rather than adding another chart, add a very common companion to cross-filtered analytical interfaces:

**an HTML table beneath the histograms showing the first 20 matching records.**

Columns might include:

* species
* island
* bill length
* bill depth
* flipper length
* body mass
* sex

As students brush histograms, the table updates.

Concepts:

* overview + details
* connecting aggregates back to individual records
* rendering ordinary HTML from visualization selection state
* limiting displayed records without changing the actual filtered set

Potential additions:

* `"Showing 20 of 47 matching penguins"`
* sortable columns
* highlight records on hover
* clear-all-filters control

This is a highly reusable dashboard pattern:

**aggregate views above → raw matching records below**

**Primary dataset:** Palmer Penguins.

**Potential alternative:** automobiles is especially strong if you want more numeric dimensions.

---

# Chapter 7 — Categorical composition and temporal visualization

## Part A — Grouped and stacked bars with Pew religion data

Use the **Pew religion dataset already available in the course**.

The important structure is roughly:

`country × religion → population / percentage`

This dataset gives the chart forms a substantive analytical purpose rather than making them arbitrary demonstrations.

---

## Example 7.1 — Grouped bar chart

Compare religious groups across countries, or countries within a selected religious category.

Introduce:

* two categorical dimensions
* nested band scales
* grouped aggregation
* categorical color
* legends

A valuable experiment is to reverse the grouping:

### Version A

`country → bars for religions`

### Version B

`religion → bars for countries`

Students can see that changing the nesting changes the analytical question.

---

## Example 7.2 — Stacked bar chart

Use essentially the same transformed table and switch representations.

Introduce:

* `d3.stack`
* series
* stack order
* stack offsets
* cumulative positions
* part-to-whole comparison

This reinforces:

> Grouped and stacked bars can encode the same table while supporting different comparisons.

---

## Example 7.3 — 100% stacked bars

Normalize each country's total to 100%.

Compare:

* absolute number of people
* percentage composition

Potential interactions:

* grouped ↔ stacked toggle
* absolute ↔ normalized toggle
* reorder countries
* choose subset of religions
* sort by one selected category

**Primary dataset:** Pew religion / country dataset.

---

# Chapter 7 continued — Lines, multiple lines, and temporal composition

## Example 7.4 — Single line chart

Introduce temporal data with a clean long-running series.

Potential datasets:

* Mauna Loa atmospheric CO₂
* global temperature anomalies
* population
* electricity generation
* energy usage

Concepts:

* parsing dates
* time scales
* chronological ordering
* line generators
* axes
* missing values
* temporal granularity

---

## Example 7.5 — Multiple-line chart

Move to repeated series over time.

Potential datasets:

* energy generation by source
* population by country
* CO₂ emissions by region
* temperatures by city

Transform:

`rows`

→ `group by series`

→ `one path per group`

Introduce:

* series grouping
* categorical color
* legends
* clutter management
* highlighting one line among many

---

## Example 7.6 — Quantized Voronoi tooltip for multiple lines

Add richer interaction to the multi-line visualization.

On pointer movement:

1. Convert pointer X into time.
2. Quantize it to the nearest actual observation date.
3. Gather the point belonging to each series for that timestamp.
4. Construct or query a Voronoi/Delaunay overlay over those candidates.
5. Determine the nearest series.
6. Emphasize that line.
7. Display its value in a tooltip.

Conceptually:

`pointer`

→ `quantized date`

→ `candidate points`

→ `Voronoi nearest point`

→ `selected series`

→ `tooltip`

Potential visual additions:

* vertical guide rule
* marker on selected line
* values from all series at that date
* click to persist a selected line

This reuses and deepens the Voronoi-overlay ideas students encountered earlier.

---

# Chapter 7 extension — Streamgraphs and the American Time Use Survey

## Example 7.7 — American Time Use streamgraph

Use the **American Time Use Survey dataset already available**.

Aggregate time spent on activity categories over a temporal axis appropriate to the dataset—for example, time of day.

Potential activity categories:

* sleeping
* work
* eating
* household activities
* leisure
* caregiving
* travel

Then construct a stacked-area visualization.

Begin with an ordinary stacked-area chart so students understand the underlying geometry.

Then switch to a streamgraph offset.

Concepts:

* temporal stacking
* `d3.stack`
* stack offsets
* stacked area
* streamgraph geometry
* shape versus precise quantitative comparison

Possible comparison:

### Stacked area

baseline = zero

### Streamgraph

baseline moves around the center

Discuss what visual patterns become easier to see and what precise comparisons become harder.

Potential interactions:

* hover individual activity bands
* tooltip at quantized time
* highlight one activity
* switch between stacked area and streamgraph
* filter by demographic group if the available ATUS data supports it

**Primary dataset:** American Time Use Survey.

This is a strong endpoint for the chart-family portion of the course because it combines stacking, time, area, color, interaction, and transformed data.

---

# Chapter 8 — Geographic visualization and the Migrant Deaths system

## Example 8.1 — Geographic foundations

Render a simple world or regional map from GeoJSON/TopoJSON.

Introduce:

* longitude / latitude
* geographic coordinates
* projections
* `geoPath`
* polygons
* projected coordinates
* GeoJSON versus TopoJSON

Possible base maps:

* world
* United States
* Mediterranean / Europe

---

## Example 8.2 — Basic choropleth

Join a tabular measure to geographic regions.

Possible measures:

* population
* income
* GDP
* life expectancy
* energy use
* demographic composition

Introduce:

* geographic keys
* tabular/geographic joins
* sequential color scales
* missing data
* normalization

Keep this version relatively simple because a more sophisticated drill-down choropleth comes later.

---

# Migrant Deaths flagship sequence

## Example 8.3 — Migrant Deaths point map

Use the Migrant Deaths dataset already available.

Plot incidents at their geographic coordinates.

Potential encodings:

* coordinates → position
* number dead/missing → radius
* route → color
* incident class → symbol or color

Add tooltips.

Potential tooltip contents:

* date
* location
* deaths
* missing
* migration route
* description

Concepts:

* point geography
* projections
* spatial overplotting
* point size
* incident-level maps

---

## Example 8.4 — Time histogram below the map

Add a temporal histogram below the geographic view.

Possible unit:

* incidents per month
* deaths per month
* incidents per year

This gives two complementary projections:

**where**

and

**when**

---

## Example 8.5 — Brush time → update map

Brush the temporal histogram.

Only incidents within the selected period appear on the map.

Architecture:

`incidents`

→ `time bins`

→ `brush range`

→ `selected incidents`

→ `map`

Potential secondary outputs:

* selected incident count
* selected deaths
* current date range
* migration-route breakdown

This should remain one of the central examples of the course.

---

# Chapter 9 — Networks, geographic flows, drill-down, and hierarchy

This chapter can unify several forms of **relationships and structural navigation**.

---

# Part A — Star Wars social network

## Example 9.1 — Force-directed Star Wars network

Use the existing **Star Wars social network dataset**.

Represent:

* characters → nodes
* interactions/co-occurrences → links

Potential encodings:

* degree → node radius
* faction or movie → color
* interaction count → link width

Introduce:

* graphs
* nodes and links
* degree
* connectivity
* force simulation
* iterative layouts

---

## Example 9.2 — Interactive Star Wars network

Add:

* hover a character → emphasize immediate neighbors
* dim unrelated nodes
* click → persistent selection
* tooltips
* minimum-edge-weight filter
* optionally drag nodes

A threshold control is particularly useful because students can watch graph topology simplify as weak links disappear.

---

## Example 9.3 — Star Wars adjacency matrix with Reorder.js

Render the same network as an adjacency matrix.

Use **Reorder.js** to explore matrix-ordering algorithms, including approaches connected to Jacques Bertin's ideas from *Semiology of Graphics*.

This is important because an unordered adjacency matrix often looks meaningless. The lesson becomes:

> The ordering of rows and columns is part of the visualization.

Explore several ordering strategies, such as those supported by the library:

* original ordering
* alphabetical
* degree-based
* spectral / graph-derived ordering
* optimal leaf ordering or related seriation approaches where appropriate

Then allow students to switch among ordering strategies interactively.

Concepts:

* adjacency matrix
* graph seriation
* reordering
* exposing structure through permutation
* Bertin's concept of rearrangeable matrices

This makes the matrix more than just an alternative rendering—it becomes a lesson in **computationally assisted visual organization**.

---

# Part B — Geographic flow networks

These examples bridge **maps and networks**, making them a good fit immediately after Star Wars.

## Example 9.4 — American Community Survey county migration flows

Use the **ACS county-to-county migration dataset**, where records describe flows between pairs of counties.

Conceptual structure:

`origin county → destination county → number of people`

Start with a U.S. county choropleth/base map.

Rather than attempting to draw every flow simultaneously, make a selected county the center of the interaction.

---

## Example 9.5 — Click county → migration arcs

Click a county.

Draw geographic arcs between the selected county and connected counties.

Potential distinction:

* outgoing migration
* incoming migration

Possible encodings:

* line width → migration count
* opacity → migration count
* color → incoming versus outgoing
* radius/marker → destination magnitude

Interaction might offer:

* `From this county`
* `To this county`
* `Both`

The architecture:

`all origin/destination records`

→ `selected county`

→ `filter flows touching county`

→ `rank / threshold`

→ `geographic arcs`

This teaches that geographic data can encode **relationships between locations**, not merely attributes of locations.

### Potential additions

* only show top 20 flows
* hover arc → origin, destination, number of migrants
* county tooltip
* incoming/outgoing totals
* bar chart of top connected counties
* click destination to move the focus there

This can turn into a highly exploratory visualization without overwhelming the screen.

---

## Example 9.6 — Global airport network

Use the available **global airport network dataset**, which has essentially the same relational structure:

`airport → airport`

This makes an excellent immediate follow-up because students can reuse the same architecture with a completely different domain.

Render:

* world map
* airport points
* selected airport
* route arcs

Click an airport and display routes emanating from or arriving at it.

Potential encodings:

* route frequency or importance → width
* airport traffic → radius
* country/region → color

This reinforces a major abstraction:

> County migration and airline routes are both geographic networks.

The same visualization system can consume either:

```text
origin location
destination location
weight
```

The difference is primarily domain semantics.

This would be a good opportunity to extract a reusable **GeographicFlowMap** component.

---

# Part C — Geographic drill-down

## Example 9.7 — U.S. state choropleth

Create a national choropleth showing one variable by state.

Possible nonpolitical measures:

* population
* income
* housing cost
* climate
* employment
* demographic indicators
* Census measures

Add tooltip and selection state.

---

## Example 9.8 — State → county drill-down

Click a state.

The visualization transitions from:

`U.S. states`

to:

`counties in selected state`

The system should:

1. establish `selectedState`
2. frame/zoom the map to the state's bounds
3. reveal or load county geometry
4. join county-level data
5. recolor counties using the selected metric

Add:

* smooth transition
* state title
* back button
* perhaps breadcrumb navigation

Architecture:

`national dataset`

→ `select state`

→ `county geometry + county data`

→ `county visualization`

This teaches **semantic drill-down**, distinct from ordinary geometric zooming.

---

# Part D — D3 hierarchy family

Use one hierarchical dataset repeatedly so students can compare visual encodings directly.

Potential datasets:

* Flare
* NPM hierarchy
* file-system hierarchy
* dependency hierarchy

## Example 9.9 — Tidy node-link tree

Use:

* `d3.hierarchy`
* `d3.tree`

Concepts:

* root
* parent
* child
* leaf
* depth
* subtree

---

## Example 9.10 — Cluster / dendrogram

Use:

* `d3.cluster`

Compare leaf alignment and spacing with the tidy tree.

Optionally introduce radial cluster layout.

---

## Example 9.11 — Treemap

Use:

* `d3.treemap`

Encode quantities as nested rectangular areas.

Discuss:

* containment
* space efficiency
* magnitude
* difficulty of topology tracing

---

## Example 9.12 — Circle packing

Use:

* `d3.pack`

Render the same hierarchy as nested circles.

Compare the tradeoff:

* visually expressive containment
* less efficient area usage than treemap

---

## Example 9.13 — Icicle

Use:

* `d3.partition`

Render hierarchy depth as rectangular bands.

This makes depth and ancestry extremely explicit.

---

## Example 9.14 — Sunburst

Use the same partition values in polar coordinates.

This makes a powerful implementation point:

> Icicle and sunburst can derive from the same hierarchical layout and differ primarily in the final coordinate mapping.

---

### D3 hierarchy family to cover

By the end of this sequence students should have encountered:

* **tree**
* **cluster / dendrogram**
* **radial tree**
* **radial cluster**
* **treemap**
* **circle packing**
* **partition / icicle**
* **partition / sunburst**

Alongside the data-building APIs:

* `d3.hierarchy`
* `d3.stratify`

The pedagogical framing is:

**same hierarchy → many valid spatial encodings**

---

# Chapter 10 — Color and perceptual encoding

This chapter can deliberately reuse previous examples.

## Example 10.1 — Color-scale laboratory

Compare:

* categorical
* sequential
* diverging
* continuous
* quantized
* quantile
* threshold

Focus on when each mathematical mapping matches the semantics of the underlying data.

---

## Example 10.2 — Choropleth color design

Return to a geographic dataset.

Compare:

* continuous sequential scale
* quantized scale
* quantile scale
* threshold scale
* diverging scale

Discuss:

* skew
* outliers
* domain selection
* meaningful midpoint
* normalization
* missing values

---

## Example 10.3 — Visual encoding laboratory

Represent identical values using:

* position
* length
* area
* radius
* angle
* color luminance
* saturation

Students can directly compare perceptual effectiveness.

This is a good chapter to emphasize *Visualization Analysis and Design* principles rather than introducing additional software architecture.

---

# Chapter 11 — Scaling cross-filtering and visualization computation

Cross-filtering is already understood from Chapter 6.

Now ask:

> How does the architecture change when the data becomes too large for a naive implementation?

---

## Example 11.1 — Benchmark the baseline

Take a cross-filtered multi-view system and progressively increase row count.

Good dataset choices:

* flights
* large synthetic tabular data
* taxi trips
* ACS migration records

Measure:

* filter computation
* binning/aggregation
* rendering
* frame responsiveness

Introduce browser performance tooling.

Teach students to distinguish:

**computation bottleneck**

from

**rendering bottleneck**

---

## Example 11.2 — Main-thread optimization

Improve the baseline before changing architecture.

Possible techniques:

* memoization
* precomputation
* indexing
* maintaining lookup structures
* avoiding repeated filtering
* minimizing unchanged aggregations
* typed arrays where appropriate
* Crossfilter-style indexing / bitsets conceptually

The lesson is:

> Optimize from evidence, not intuition.

---

## Example 11.3 — Web Worker cross-filtering

Move computation off the UI thread.

Architecture:

```text
MAIN THREAD

brush / selection
      ↓
filter specification
      ↓
postMessage
      ↓

WEB WORKER

filter records
aggregate bins
compute summaries
      ↓
postMessage
      ↓

MAIN THREAD

render
```

Introduce:

* workers
* messaging
* asynchronous computation
* serialization
* transferable data where appropriate
* keeping pointer interaction responsive

---

## Example 11.4 — Server-side aggregation and filtering

Take the same interface and move the data computation to a server/database.

For example:

`selected delay = 10–60`

`selected distance = 500–1500`

becomes a query whose response contains only:

* bins
* counts
* aggregates
* perhaps limited matching rows

Architecture:

`interaction`

→ `query parameters`

→ `database/server`

→ `aggregated response`

→ `views`

Possible technologies to discuss or prototype:

* PostgreSQL
* DuckDB
* ClickHouse

The important conceptual distinction:

### Browser-side

Raw dataset resides in client memory.

### Worker-side

Raw dataset still resides locally, but computation moves off the main thread.

### Server-side

Client might never receive the raw dataset.

---

# Chapter 12 — Coordinated exploratory applications

This is where the smaller interaction patterns become complete analytical systems.

## Example 12.1 — Migrant Deaths Explorer

Expand the Chapter 8 application.

Possible views:

* geographic map
* temporal histogram
* route breakdown
* cause/category bars
* selected-record table
* summary metrics

Interactions:

* brush date
* select route
* select category
* hover incident
* clear filters

Architecture:

`shared filter state`

→ `selected incidents`

→ `view-specific transformations`

→ `coordinated views`

This can be one of the primary reference applications for the course.

---

## Example 12.2 — County Migration Explorer

Return to the ACS migration-flow map and extend it beyond the single selected-county interaction.

Views might include:

* county map
* outgoing/incoming migration arcs
* top destination/origin bar chart
* migration magnitude distribution
* county detail panel

Interaction:

`click county`

→ `selected county`

→ simultaneously update all linked views

This is particularly valuable because the raw structure is relational rather than simply tabular.

---

## Example 12.3 — Global Airport Explorer

Use the same architectural pattern for global airports.

Potential views:

* world route map
* selected-airport routes
* busiest destination bars
* distance distribution
* country/region summaries

This allows students to see that one coordinated system architecture can generalize across very different domains.

---

## Optional — Flights Explorer

A conventional flights dashboard is still useful if you want a pure tabular cross-filtering example.

Possible views:

* delay histogram
* departure-time histogram
* carrier bars
* distance histogram
* delay scatter plot

It would be particularly appropriate as the **performance testbed for Chapter 11**, whereas County Migration and Airports provide richer spatial/network applications in Chapter 12.

---

## Interaction-state taxonomy

At this point, make the interaction vocabulary explicit:

* **hover** → transient focus
* **click** → persistent selection
* **brush** → interval/region selection
* **filter** → restrict records
* **cross-filter** → selection propagates among views
* **drill-down** → change level of abstraction
* **zoom/pan** → navigate geometric space
* **semantic zoom** → alter what information is displayed based on scale

---

# Chapter 13 — Embeddings, UMAP, clustering, and semantic space

The main datasets here should be **Migrant Deaths descriptions** and **top NPM package descriptions**.

These let students compare familiar spatial/network data to a completely different notion of "distance": semantic similarity.

---

# Dataset A — Migrant Deaths descriptions

The incident descriptions provide text for embedding.

Pipeline:

`incident description`

→ `embedding model`

→ `high-dimensional vector`

→ `UMAP`

→ `2D semantic position`

---

## Example 13.1 — Migrant Deaths semantic scatter plot

Compute embeddings for descriptions and project them with UMAP.

Render one point per incident.

Potential color attributes:

* migration route
* cause
* year
* region
* cluster

This gives two different spaces for the same records:

### Geographic space

Where did the incident occur?

### Semantic space

Which incident descriptions are similar?

That comparison is conceptually strong.

---

## Example 13.2 — Zoomable embedding visualization

Make the embedding scatter plot zoomable and pannable.

At the global level:

* show point clouds / clusters

When zoomed:

* individual points become more distinguishable

At detailed scale:

* expose labels or richer hover behavior

This becomes a good case for canvas rendering if point counts justify it.

---

## Example 13.3 — Tooltips on embedding points

Hover individual points and show:

* description
* date
* location
* route
* deaths / missing
* any known category

Students can continually connect the abstract embedding position back to the source record.

---

## Example 13.4 — Clustering

Cluster the embedding.

Potential algorithms:

* DBSCAN
* HDBSCAN
* k-means

Then color by cluster.

Compare cluster assignments against known metadata:

* route
* cause
* region
* time period

Important distinction:

**embedding / UMAP:** creates coordinates.

**clustering:** assigns groups.

They should not be conflated.

---

# Dataset B — Top NPM packages

Use NPM package descriptions as another text corpus.

Pipeline:

`package description`

→ `embedding`

→ `UMAP`

→ `semantic map`

Potential natural groupings might include:

* React ecosystem
* visualization
* databases
* build tooling
* testing
* CLI
* networking
* TypeScript
* utilities

---

## Example 13.5 — NPM semantic landscape

Encode:

* UMAP coordinates → position
* weekly downloads → radius
* cluster → color

Add:

* zoom
* pan
* tooltip
* package search
* click selection

Tooltip:

* package name
* description
* downloads
* version
* repository information if available

---

## Example 13.6 — Semantic neighbors

Click an NPM package.

Determine its closest neighbors in the original embedding space or projected space, depending on what you want to demonstrate.

Show:

* nearest package names
* descriptions
* distances

This makes vector similarity concrete.

---

## Example 13.7 — Brush semantic space → derive summaries

Bring cross-filtering back.

For Migrant Deaths:

`brush semantic cluster`

→ show:

* routes
* years
* causes
* geographic distribution
* matching records

For NPM:

`brush semantic cluster`

→ show:

* package list
* keyword frequencies
* download distribution
* clusters/categories

Again the familiar architecture holds:

`selection → subset → derived views`

---

# Chapter 14 — Focus + context, navigation, and semantic zoom

## Example 14.1 — Overview + detail time series

Use a long temporal dataset.

Possible datasets:

* atmospheric CO₂
* temperature
* energy
* population

Render:

### Overview

entire time span

### Detail

selected interval

Brush the overview to navigate the detail chart.

This interaction resembles cross-filtering technically, but the analytical purpose is different:

> The overview brush primarily controls navigation, not comparative subset analysis.

---

## Example 14.2 — Zoomable hierarchy

Return to:

* treemap
* icicle
* sunburst

Make it navigable.

Click a node to make that subtree the focus.

Add:

* animated transitions
* breadcrumbs
* back navigation
* current-node label

This connects directly to the geographic state → county drill-down.

---

## Example 14.3 — Semantic zoom in embeddings

Revisit the NPM or Migrant Deaths embedding.

Change what is rendered as scale changes.

For example:

### Far out

* cluster boundaries
* cluster labels

### Medium zoom

* individual points

### Close

* package names / incident snippets

This distinguishes:

**geometric zoom**

from

**semantic zoom**

where the representation itself changes as the user navigates.

---

# Chapter 15 — Integration and visualization-system architecture

The final instructional material should synthesize rather than introduce another chart form.

## Example 15.1 — From unfamiliar dataset to visualization system

Start from a new dataset.

Work visibly through the entire design process:

`data`

→ `domain questions`

→ `data abstraction`

→ `transformations`

→ `visual encoding`

→ `views`

→ `interaction`

→ `coordination`

This shifts the final emphasis from:

> How do I implement this chart?

to:

> How do I decide what analytical system the data needs?

---

## Example 15.2 — Refactor a substantial application

Choose one mature system:

* Migrant Deaths Explorer
* County Migration Explorer
* NPM semantic explorer

Break it into clear modules:

* loading
* parsing
* transformations
* filtering
* indexes
* shared state
* scales
* marks
* interaction
* layout
* coordinated views

Students can see what a maintainable visualization application looks like after weeks of incremental construction.

---

## Example 15.3 — The visualization architecture ladder

Close with four progressively richer architectures.

### 1. Static visualization

```text
raw data
   ↓
transformation
   ↓
scales
   ↓
marks
```

### 2. Interactive visualization

```text
raw data
   ↓
state
   ↓
transformation
   ↓
scales
   ↓
marks

interaction ─────→ state
```

### 3. Coordinated multi-view visualization

```text
raw data
   ↓
shared filter state
   ↓
filtered records
   ↓
view-specific transformations
   ↓
multiple views
   ↓
interaction
   └────────────→ shared state
```

### 4. Scalable visualization system

```text
interaction
   ↓
query/filter specification
   ↓
main thread / worker / server
   ↓
derived data + aggregates
   ↓
coordinated views
```

---

# Canonical dataset portfolio

The course would now deliberately reuse roughly these dataset families.

* **Palmer Penguins**

  * scatter plot
  * color + legend
  * configurable X/Y
  * bar chart
  * histograms
  * brushing
  * cross-filtering
  * filtered HTML table

* **Pew Religion**

  * grouped bars
  * stacked bars
  * normalized stacked bars
  * categorical composition

* **Climate / energy / OWID-style time series**

  * line chart
  * multiple lines
  * quantized Voronoi tooltip
  * overview + detail

* **American Time Use Survey**

  * stacked area
  * streamgraph
  * temporal composition

* **Migrant Deaths**

  * point map
  * time histogram
  * brush → map
  * complete explorer
  * descriptions → embeddings
  * UMAP
  * clustering
  * semantic zoom

* **Star Wars social network**

  * force-directed network
  * neighborhood interaction
  * adjacency matrix
  * Reorder.js / Bertin-inspired reordering

* **ACS County-to-County Migration**

  * county map
  * origin/destination flows
  * geographic arcs
  * selected-county explorer

* **Global Airport Network**

  * geographic network
  * route arcs
  * selected-airport exploration
  * reuse of geographic-flow architecture

* **U.S. state/county data**

  * state choropleth
  * click state → county drill-down

* **Flare / NPM / other hierarchy**

  * tree
  * cluster
  * radial tree
  * treemap
  * circle pack
  * icicle
  * sunburst

* **Flights or another large tabular dataset**

  * performance benchmarking
  * main-thread optimization
  * Web Workers
  * server-side querying

* **Top NPM packages**

  * description embeddings
  * UMAP
  * clustering
  * zoomable scatter plot
  * semantic neighbors
  * cross-filtering semantic selections

---

# The major conceptual threads

The roadmap now has several threads that recur rather than appearing once.

### **Aggregation**

Penguin bars
→ histograms
→ Pew stacks
→ streamgraph
→ server-side aggregates

### **Selection and cross-filtering**

Penguin brush
→ histogram small multiples
→ filtered-record table
→ Migrant Deaths timeline/map
→ coordinated explorers
→ semantic-space brushing

### **Relationships**

Star Wars characters
→ adjacency matrix
→ county migration flows
→ airport routes

Here the underlying abstraction becomes:

`entities + relationships`

with different spatial strategies depending on whether the entities have geographic positions.

### **Hierarchy and drill-down**

state → county
→ tree
→ treemap
→ circle pack
→ icicle/sunburst
→ zoomable hierarchy

### **Different notions of space**

scatter-plot coordinate space
→ geographic space
→ network layout space
→ hierarchical layout space
→ semantic embedding space

That is potentially one of the more interesting conceptual arcs in the entire course.

### **Scaling**

naive browser filtering
→ indexing
→ Web Worker
→ server-side queries

So by the end of *Constructing Visualizations*, students have moved well beyond implementing a set of canonical D3 charts. They've encountered most of the major **data abstractions, spatial representations, interaction patterns, and application architectures** involved in constructing modern interactive visualization systems.
