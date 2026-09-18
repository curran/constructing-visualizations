---
name: example-creation
description: How to create a new numbered example in this course repo (src/examples), including updating the examples index, numbering conventions, and the React + D3 code organization preferences. Use whenever adding, scaffolding, or refactoring an example visualization.
---

# Example Creation Skill

This skill describes how examples are structured in this repo and the house
style for organizing React + D3 code. Follow it whenever you add a new example
or refactor an existing one.

## Where examples live

- All examples live under `src/examples/`.
- Each example is its own directory named with a zero-padded 3-digit number and
  a kebab-case title: `NNN-kebab-case-title/` (e.g. `010-hovering`,
  `011-tooltips`).
- Each directory contains the example's components, render functions,
  hooks, and config. Examples are self-contained; shared dataset loaders may be
  imported from earlier examples (e.g. `011-tooltips` imports
  `usePenguinsDataset` from `006-loading-and-summarizing-data`).

## Numbering

- Examples are numbered sequentially. To create a new example, look at the
  highest existing number under `src/examples/` and **add one**. Do not reuse or
  skip numbers.
- The directory uses the padded form (`012-my-example`) while the `id` in the
  index is the plain number as a string (`'12'`).
- For example, if current highest example is `011-tooltips`, the next new example is
  `012-...`.

## Always update the index

The examples index is `src/examples/index.ts`. **Every new example must be
registered there or it will not appear in the app.** Make two edits:

1. Add an import at the top (imports are ordered by example number):
   ```ts
   import { MyExample } from './012-my-example/MyExample';
   ```
2. Add an entry to the `examples` array (same order as the imports):
   ```ts
   {
     id: '12',
     name: 'My Example',
     component: MyExample,
   },
   ```

The `examplesMap` and `defaultExample` are derived from `examples`, so no
further index changes are needed. `src/App.tsx` renders the sidebar and the
selected example from this index.

## React + D3 organization preferences

The exemplar for our preferred structure is **`010-hovering`** (see also
`011-tooltips` for the fuller version with axes, labels, and a tooltip). Please
read those files before writing a new example.

### One component per visual layer, each rendering an SVG `<g>`

- Decompose the visualization into named layers, each its own React component:
  marks, axes, labels, overlays, etc. (e.g. `Circles`, `VoronoiOverlay`,
  `Axes`, `Labels`, `Marks`).
- Each layer component renders a single container group element with a ref and
  a descriptive class name:
  ```tsx
  const groupRef = useRef<SVGGElement>(null);
  // ...
  return <g ref={groupRef} className="circles" />;
  ```
- React owns the SVG structure and the `<g>` elements (mounting, ordering,
  layering, className, and static transforms). D3 fills each group with marks.
- The parent (e.g. `Hovering.tsx`, `Tooltips.tsx`) composes the layers inside
  one responsive `<svg>`.

### D3 selections for marks, JSX for static content

- **Rendering dynamic visual marks: use D3 selections** in a dedicated
  `render*.ts` function called from a `useEffect`. This is the default for
  anything data-driven or state-driven — circles, rects, paths, axes, Voronoi
  cells, etc.
- The pattern per layer is:
  - `Component.tsx` — React wrapper: reads props, holds the `useRef`, and calls
    the render function in `useEffect` with the current props (all props in the
    dependency array).
  - `renderComponent.ts` — a pure function that takes the D3 selection and an
    options object, and does the data join:
    ```ts
    export function renderCircles(
      group: Selection<SVGGElement, unknown, null, undefined>,
      options: RenderCirclesOptions,
    ) {
      const { data, xScale, yScale, hoveredCircleId } = options;
      group
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', (d) => xScale(d.x))
        // ...
    }
    ```
  - Export shared types/interfaces (e.g. `CircleDataPoint`,
    `RenderCirclesOptions`) from the render file and import them in the
    component.
- **Rendering static, non-dynamic content: use JSX directly.** If there is
  nothing dynamic about it, plain JSX inside the `<g>` is preferred over a D3
  selection. Text overlays are the canonical case — see
  `011-tooltips/Labels.tsx`, which renders the title and axis labels as JSX
  `<text>` elements. Do not spin up a D3 data join just to draw fixed text.
- Rule of thumb: if D3 is only being used to fill in fixed attributes with no
  data join or per-datum variation, render it with JSX instead. Axes are a
  legitimate D3 case because `d3-axis` generates many ticks dynamically.

### Responsive layout

- Reuse the `useDimensions` hook (copy it into the example directory) to
  measure the container.
- Set up the container as `<div ref={divRef} className="relative w-full h-full">`
  and the `<svg className="absolute inset-0 w-full h-full">`.
- Guard rendering until dimensions are non-zero and scales exist.
- Derive scales from data and dimensions with `useMemo` / a `useScales` hook so
  they are not rebuilt on unrelated state changes.

### Other conventions

- Keep all tweakable values (margins, titles, axis labels, font sizes,
  accessors) in a `tweakables.ts` file so they can be adjusted in one place, including the margins.
- Use `useMemo` to derive filtered/processed data rather than recomputing it
  inline every render (e.g. dropping `NA` rows in `011-tooltips`).
- Keep a single piece of interaction state (e.g. `hoveredIndex`) in the parent;
  overlays set it and layers derive their appearance from it.
- Memoize comment-worthy logic, but prefer clear, short comments explaining
  intent over narrating the code.
- Add `role="img"` and an `aria-label` to the top-level `<svg>`.
- Use named exports for example entry components (e.g. `export function Hovering`).

## Checklist for a new example

1. Determine the next number (`highest + 1`, 3-digit padded).
2. Create `src/examples/NNN-kebab-title/`.
3. Copy `useDimensions.ts` (and `margin.ts`/`useScales.ts` if needed) into the
   new directory.
4. Add `config.ts` for tweakable values and accessors.
5. Build the example as an entry component plus per-layer components, each with
   a `render*.ts` for dynamic marks and JSX for static text.
6. Register the example in `src/examples/index.ts` (import + `examples` entry).
7. Verify: `npm run lint` and `npm run build` (and `npm run prettier` to format).
8. Optionally confirm it renders via the dev server (`npm run dev`) using the
   `?example=NN` deep link.