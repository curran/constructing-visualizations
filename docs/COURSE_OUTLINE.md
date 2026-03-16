# 15-Week Course: React + D3 through *Visualization Analysis & Design*

## Core technical framing

* **React manages state**
* **D3 manages SVG/DOM manipulation**
* **`useEffect` + `useRef` are the main integration point between React and D3**
* Course builds **static views first**, then introduces **cross-filtering mid-course**, then develops **systems built on linked views**

---

## Week 1 — Course framing + React/D3 architecture

* Introduce the course, final outcomes, and workflow
* Explain the React/D3 split:

  * React: data flow, UI state, controls
  * D3: scales, axes, layout, SVG updates
* Establish `useEffect` + `useRef` as the bridge
* Build first minimal SVG in React with D3

## Week 2 — Why visualize? Munzner’s nested model

* Munzner: why visualization, problem framing, levels of design
* Introduce the nested model
* Discuss what makes a visualization useful
* Create a very simple static chart and critique it

## Week 3 — Data/task abstraction

* Munzner: abstraction of data and user tasks
* Identify tables, attributes, items, marks, and tasks
* Map real questions into abstract visualization tasks
* Build a static scatterplot from tabular data

## Week 4 — Marks and channels

* Munzner: encodings, marks, channels
* Position, length, angle, area, color, shape
* Why some encodings are more effective than others
* Refine the scatterplot and bar chart with better encodings

## Week 5 — Scales, axes, and layout

* D3 scales, axes, margins, coordinate systems
* Visual hierarchy and readable chart construction
* Build reusable chart scaffolding
* Static views only

## Week 6 — React state + D3 rendering pattern

* Formalize the component pattern:

  * `useRef` for SVG container
  * `useEffect` for D3 rendering/updating
  * `useState` for controls and application state
* Build controlled static charts with UI inputs
* Keep D3 imperative and React declarative

## Week 7 — Building multiple static views

* Compose multiple charts in one page
* Shared data, separate visual views
* Consistent scales, layout, and component structure
* Build a small static dashboard

## Week 8 — Interaction fundamentals

* Selections, hover, tooltips, highlighting
* Brushing and filtering basics
* Introduce interaction design in Munzner
* Add light interaction without full coordination yet

## Week 9 — Introduction to cross-filtering

* Define cross-filtering and linked views
* Show how one view can filter another
* Introduce shared filter state in React
* Build first two-view coordinated example

## Week 10 — Cross-filter architecture

* Centralized filter state with `useState`
* Derived filtered data from active selections
* Connect brush/selection events from D3 back into React state
* Build a small multi-view cross-filter dashboard

## Week 11 — From charts to systems

* Move from individual views to reusable visualization systems
* Shared state model, reusable hooks, chart contracts
* Separate concerns:

  * data loading
  * filtering
  * rendering
  * controls
* Refactor cross-filter dashboard into cleaner architecture

## Week 12 — Performance and large-data thinking

* Efficient update patterns for D3 in React
* Avoid unnecessary rerenders
* Introduce throttling/debouncing where relevant
* Discuss workers and scalable cross-filtering patterns
* Optimize the dashboard

## Week 13 — Coordinated dashboards

* Design full linked-view systems
* Combine charts, legends, controls, annotations
* Focus on usability and analytical workflows
* Build a richer dashboard with coordinated views

## Week 14 — Evaluation and iteration

* Munzner: evaluate effectiveness
* Critique visual choices, interactions, and workflow support
* Conduct lightweight usability review
* Revise the dashboard based on feedback

## Week 15 — Final project

* Present a complete React + D3 analytical system
* Must include:

  * multiple views
  * shared state
  * cross-filtering
  * clear visual encodings
  * thoughtful interaction design
* Final critique and wrap-up

---

## Throughline of the course

1. **Start with static views**
2. **Learn React/D3 integration via `useEffect` + `useRef`**
3. **Use React state via `useState` for application logic**
4. **Introduce cross-filtering in the middle**
5. **End with full analytical systems built from coordinated views**

## Recommended implementation pattern

```js
function Chart({ data, width, height, filters, setFilters }) {
  const ref = useRef(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    // D3 handles drawing and updates here
  }, [data, width, height, filters]);

  return <svg ref={ref} width={width} height={height} />;
}
```

## Final learning goal

By the end of the course, students should be able to build **interactive analytical dashboards in React and D3**, grounded in **Munzner’s theory**, using a clean architecture where **React owns state** and **D3 owns rendering**.

