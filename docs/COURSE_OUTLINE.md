# Visualization Analysis and Design with React + D3

## Course description

This course introduces students to the theory and practice of data visualization through the framework of Tamara Munzner's _Visualization Analysis and Design_. Students learn to reason about visualization through data abstraction, task abstraction, visual encoding, interaction, idiom selection, and evaluation.

Technically, students build interactive visualizations using React, SVG, and D3. The course progresses from basic scatterplots to interaction, small multiples, maps, networks, focus+context designs, and final project development.

Each week includes two assignments:

- a standalone weekly assignment to practice the current concept, and
- a semester project milestone that gradually develops a polished final visualization project.

---

## Course learning goals

By the end of the course, students should be able to:

1. Analyze datasets using Munzner's what / why / how framework.
2. Choose appropriate visual encodings for different data and task types.
3. Build visualizations using React, SVG, and D3.
4. Implement scales, axes, legends, interaction, filtering, brushing, and coordinated views.
5. Critique visualizations using design principles and task-oriented reasoning.
6. Design and present a complete interactive visualization project.
7. Explain design choices clearly in terms of data, tasks, marks, channels, and interaction.

---

## Semester structure

| Component                   | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| Weekly skill assignments    | Short technical/conceptual exercises unrelated to final project  |
| Semester project milestones | Weekly deliverables building toward final project                |
| Readings                    | Munzner chapters and supplemental examples                       |
| Studios                     | In-class React + D3 implementation practice                      |
| Critiques                   | Regular discussion of visualization design decisions             |
| Final project               | Interactive visualization with design rationale and presentation |

---

## Suggested grading breakdown

| Category                    | Weight |
| --------------------------- | ------ |
| Weekly skill assignments    | 30%    |
| Semester project milestones | 25%    |
| Final project               | 25%    |
| Final presentation          | 10%    |
| Participation / critique    | 10%    |

---

## 15-week course overview

| Week | Munzner alignment | Theme                   | React + D3 focus                        | Standalone weekly assignment                  | Semester project milestone                      |
| ---- | ----------------- | ----------------------- | --------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| 1    | Ch. 1             | Why visualize?          | React components, SVG basics            | Make a simple scatterplot                     | Explore 3 possible datasets                     |
| 2    | Ch. 2             | What: data abstraction  | CSV loading, parsing, data types        | Write a data abstraction for a sample dataset | Choose project dataset candidate                |
| 3    | Ch. 3             | Why: task abstraction   | State, controls, dropdowns              | Convert questions into tasks                  | Write project audience + questions              |
| 4    | Ch. 4             | How: marks and channels | Scales, axes, encodings                 | Build 3 scatterplot variations                | Make first project encoding sketch              |
| 5    | Ch. 5             | Design rules            | Labels, legends, responsive layout      | Critique and redesign a weak chart            | Project design critique                         |
| 6    | Ch. 6             | Arrange tables          | Bar charts, aggregation, heatmaps       | Build comparison/distribution charts          | Build alternate project prototype               |
| 7    | Ch. 7             | Spatial data            | GeoJSON, projections, maps              | Build a map from provided data                | Decide whether project has spatial structure    |
| 8    | Ch. 8             | Networks and trees      | Hierarchies, force layout, trees        | Build network or tree visualization           | Decide whether project has relational structure |
| 9    | Ch. 9             | Color                   | Color scales, palettes, legends         | Redesign color in a chart                     | Apply project color/accessibility pass          |
| 10   | Ch. 10            | Manipulate view         | Tooltips, filters, zoom, brush          | Add interaction to a chart                    | Add first project interaction                   |
| 11   | Ch. 11            | Multiple views          | Small multiples, linked views           | Build small multiples                         | Add project second view or faceting             |
| 12   | Ch. 12            | Reduce                  | Filtering, binning, aggregation         | Reduce a large dataset                        | Improve project data transformation             |
| 13   | Ch. 13            | Focus + context         | Overview/detail, annotations            | Build overview + detail view                  | Add project annotations or detail panel         |
| 14   | Ch. 14            | Evaluation              | Refactoring, accessibility, peer review | Conduct peer usability critique               | Final project draft + peer review               |
| 15   | Ch. 15            | Final synthesis         | Deployment, polish                      | Final reflection                              | Final presentation and submission               |

---

## Week 1 — Why visualize?

### Munzner theme

Visualization helps people reason about data. It can support exploration, confirmation, communication, explanation, and decision-making.

### React + D3 concepts

- React functional components
- JSX
- SVG coordinate system
- Basic marks: `<circle>`, `<rect>`, `<line>`

### Weekly skill assignment

Build a simple scatterplot using hardcoded data in React + SVG.

### Semester project milestone

Explore 3 possible datasets. Write a short paragraph on each describing what the data contains, where it comes from, and what questions it might answer.

---

## Week 2 — What: data abstraction

### Munzner theme

All datasets can be described in terms of dataset types, attribute types, and the relationships between items. Understanding the "what" is the foundation of visualization design.

### React + D3 concepts

- Loading CSV data with D3
- Parsing and typing data
- Mapping data to SVG attributes

### Weekly skill assignment

Write a data abstraction for a provided sample dataset: identify dataset type, attribute types (quantitative, ordinal, categorical), and key items.

### Semester project milestone

Choose a dataset candidate for your semester project. Write a brief data abstraction: what type of data is it, what are the key attributes, and what makes it interesting?

---

## Week 3 — Why: task abstraction

### Munzner theme

User tasks can be abstracted into a small vocabulary: search, query, compare, summarize, explore, annotate. Identifying the right task helps choose the right visualization.

### React + D3 concepts

- React `useState` for UI controls
- Dropdown menus and filters
- Conditional rendering

### Weekly skill assignment

Take a set of real-world questions and convert them into abstract visualization tasks using Munzner's task vocabulary.

### Semester project milestone

Write a project audience statement and a list of 3–5 abstract tasks your visualization should support.

---

## Week 4 — How: marks and channels

### Munzner theme

Visual encoding maps data to marks (points, lines, areas) and channels (position, color, size, shape). Some channels are more effective than others depending on data type.

### React + D3 concepts

- D3 linear and ordinal scales
- Axes with `d3-axis`
- Encoding data to position, color, and size

### Weekly skill assignment

Build 3 variations of a scatterplot, each using a different encoding for a third variable (color, size, shape). Reflect on the tradeoffs.

### Semester project milestone

Sketch a first visual encoding for your project dataset. Map at least 3 attributes to marks and channels. Justify your choices.

---

## Week 5 — Design rules

### Munzner theme

Good visualization design follows principles of expressiveness and effectiveness. Common pitfalls include overplotting, misleading scales, excessive decoration, and poor labeling.

### React + D3 concepts

- Labels and annotations in SVG
- Responsive layout with viewBox
- Legends

### Weekly skill assignment

Find a weak or misleading chart in the wild. Critique it using Munzner's principles. Redesign it.

### Semester project milestone

Conduct a design critique of your current project prototype. Identify at least 3 design problems and propose fixes.

---

## Week 6 — Arrange tables

### Munzner theme

Tabular data can be visualized using bar charts, stacked bars, heatmaps, dot plots, and other arrangements. The right arrangement depends on the task.

### React + D3 concepts

- Bar charts with D3 band scales
- Aggregation with `d3-array`
- Heatmaps using color encoding

### Weekly skill assignment

Build a chart that supports comparison (e.g., grouped bar) and one that supports distribution (e.g., histogram or heatmap).

### Semester project milestone

Build an alternate prototype of your project using a different visual arrangement. Compare it with your first sketch.

---

## Week 7 — Spatial data

### Munzner theme

Spatial datasets have geographic or geometric structure. Maps leverage positional encoding as a primary channel, which is highly effective for spatial tasks.

### React + D3 concepts

- GeoJSON and TopoJSON
- D3 projections and `geoPath`
- Choropleth maps

### Weekly skill assignment

Build a choropleth map from a provided GeoJSON dataset.

### Semester project milestone

Decide whether your project dataset has meaningful spatial structure. If so, sketch a map view. If not, explain why spatial encoding is not appropriate.

---

## Week 8 — Networks and trees

### Munzner theme

Network and tree datasets have relational structure. Idioms include node-link diagrams, adjacency matrices, and treemaps.

### React + D3 concepts

- D3 force layout
- Hierarchical layouts (treemap, dendrogram)
- SVG `<line>` and `<path>` for edges

### Weekly skill assignment

Build either a network visualization (force-directed) or a tree visualization (treemap or dendrogram) from provided data.

### Semester project milestone

Decide whether your project dataset has relational structure. If so, sketch a network or tree view. If not, explain why.

---

## Week 9 — Color

### Munzner theme

Color is a powerful but easily misused channel. Sequential, diverging, and categorical palettes serve different data types. Accessibility requires sufficient contrast and colorblind-safe choices.

### React + D3 concepts

- D3 color scales (`scaleSequential`, `scaleDiverging`, `scaleOrdinal`)
- Color legends
- Accessibility considerations

### Weekly skill assignment

Take an existing chart and redesign its color scheme. Apply a sequential scale, a diverging scale, and a categorical scale to the same data. Reflect on the differences.

### Semester project milestone

Apply a deliberate color scheme to your project. Verify accessibility using a colorblind simulation tool.

---

## Week 10 — Manipulate view

### Munzner theme

Interaction idioms let users change what they see: filtering, zooming, panning, selecting, and brushing. These support exploration and focus.

### React + D3 concepts

- D3 brush
- Zoom and pan with `d3-zoom`
- Tooltips
- Filtering with React state

### Weekly skill assignment

Add at least two interaction techniques to an existing chart: a tooltip and a brush or filter.

### Semester project milestone

Add the first interactive feature to your project. This could be a tooltip, a dropdown filter, or a brush selection.

---

## Week 11 — Multiple views

### Munzner theme

Multiple coordinated views let users see different aspects of the same data simultaneously. Small multiples support comparison across facets.

### React + D3 concepts

- Small multiples with React
- Shared state across views
- Linked highlighting

### Weekly skill assignment

Build a small multiples visualization: the same chart repeated for different subsets or facets of the data.

### Semester project milestone

Add a second view to your project, or facet an existing view into small multiples. The views should share state or be coordinated in some way.

---

## Week 12 — Reduce

### Munzner theme

Large datasets require reduction strategies: filtering, aggregation, binning, and sampling. These reduce visual complexity without losing the signal.

### React + D3 concepts

- Aggregation with `d3-array` (`rollup`, `group`)
- Binning with `d3.bin`
- Dynamic filtering with React state

### Weekly skill assignment

Take a large dataset and apply at least two reduction strategies. Show before and after views.

### Semester project milestone

Improve your project's data transformation layer. Apply at least one aggregation or reduction to simplify the display and support the user's tasks.

---

## Week 13 — Focus + context

### Munzner theme

Focus+context designs let users zoom into detail while retaining awareness of the overall structure. Techniques include overview+detail, semantic zoom, and annotations.

### React + D3 concepts

- Overview + detail with linked views
- D3 zoom for semantic zooming
- Annotations with SVG text and lines

### Weekly skill assignment

Build an overview+detail view: one chart provides a broad summary, and selecting a region reveals detail in a second view.

### Semester project milestone

Add an annotation layer or a detail panel to your project. This could be callout labels, a detail tooltip panel, or a focus view.

---

## Week 14 — Evaluation

### Munzner theme

Visualizations can be evaluated through expert review, user studies, and heuristic analysis. Identifying usability problems and fixing them is part of the design process.

### React + D3 concepts

- Code refactoring for clarity
- Accessibility audit (keyboard nav, ARIA, contrast)
- Performance review

### Weekly skill assignment

Conduct a peer usability critique of a classmate's project. Write a structured critique using Munzner's evaluation framework.

### Semester project milestone

Complete a full draft of your project. Participate in peer review. Incorporate at least 3 pieces of feedback.

---

## Week 15 — Final synthesis

### Munzner theme

A complete visualization system integrates data abstraction, task abstraction, visual encoding, and interaction into a coherent, usable whole.

### React + D3 concepts

- Final polish and deployment
- README and design rationale documentation
- Presentation preparation

### Weekly skill assignment

Write a final reflection: what did you learn, what would you do differently, and what visualization problems remain unsolved?

### Semester project milestone

Submit your final project and present it to the class. Your presentation should cover: the dataset, the tasks, the design decisions, and what you would improve with more time.
