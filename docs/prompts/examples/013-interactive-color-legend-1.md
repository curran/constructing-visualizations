Use the example creation skill to create a new example based on our scatter plot example. Start by copying example number 8 and change it around so that we encode species using color. Also make the color legend interactive, as in the following reference examples, but using the React and D3 patterns of our codebase. Be sure to include the fade transitions to make it look polished.

The reference examples:

**index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>React Starter</title>
    <script type="importmap">
      {
        "imports": {
          "react": "https://cdn.jsdelivr.net/npm/react@19.1.0/+esm",
          "react/jsx-runtime": "https://cdn.jsdelivr.net/npm/react@19.1.0/jsx-runtime/+esm",
          "react-dom/client": "https://cdn.jsdelivr.net/npm/react-dom@19.1.0/client/+esm",
          "d3": "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm"
        }
      }
    </script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="index.jsx"></script>
  </body>
</html>

```

**README.md**

```

```

**index.jsx**

```
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
const root = createRoot(document.getElementById('root'));
root.render(<App />);

```

**data.js**

```javascript
export const data = [
  { id: 1, name: 'A', x: 0, y: 0 },
  { id: 2, name: 'B', x: 0, y: 0 },
  { id: 3, name: 'C', x: 0, y: 0 },
  { id: 4, name: 'D', x: 0, y: 0 },
  { id: 5, name: 'E', x: 0, y: 0 },
];

```

**styles.css**

```css
body {
  margin: 0;
  overflow: hidden;
}

.container {
  width: 100vw;
  height: 100vh;
}

```

**viz.js**

```javascript
import { createColorScale } from './colorScale.js';
import { renderColorLegend } from './renderColorLegend.js';

export const viz = (
  svg,
  { data, width, height, hoveredCircleId, onCircleHover },
) => {
  const colorScale = createColorScale();

  svg.attr('width', width).attr('height', height);

  renderColorLegend(svg, {
    colorScale,
    width,
    height,
    hoveredCircleId,
    onCircleHover,
  });
};

```

**App.jsx**

```
import React, { useRef, useEffect, useState } from 'react';
import { select } from 'd3';
import { data } from './data.js';
import { viz } from './viz.js';

export const App = () => {
  const ref = useRef(null);
  const [hoveredCircleId, setHoveredCircleId] =
    useState(null);

  useEffect(() => {
    const container = ref.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    viz(select(ref.current), {
      data,
      width,
      height,
      hoveredCircleId,
      onCircleHover: setHoveredCircleId,
    });
  }, [hoveredCircleId]);

  return (
    <div className="container">
      <svg ref={ref}></svg>
    </div>
  );
};

```

**renderCircles.js**

```javascript
export const renderCircles = (
  selection,
  {
    data,
    hoveredCircleId,
    textSpacing,
    onCircleHover,
    colorScale,
    circleRadius = 30,
  },
) => {
  const transitionDuration = 300; // milliseconds

  selection
    .selectAll('circle')
    .data(data, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', circleRadius)
    .attr('fill', (d) => colorScale(d.name))
    .attr('stroke', 'none')
    .attr('stroke-width', 0)
    .style('cursor', 'pointer')
    .on('mouseover', (event, d) => {
      onCircleHover(d.id);
    })
    .on('mouseout', (event, d) => {
      onCircleHover(null);
    })
    .transition()
    .duration(transitionDuration)
    .style('opacity', (d) =>
      hoveredCircleId === null || d.id === hoveredCircleId
        ? 1
        : 0.2,
    );
};

```

**renderText.js**

```javascript
export const renderText = (
  selection,
  {
    data,
    hoveredCircleId,
    textSpacing,
    onCircleHover,
    colorScale,
    circleRadius = 30,
  },
) => {
  const transitionDuration = 300; // milliseconds

  selection
    .selectAll('text')
    .data(data, (d) => d.id)
    .join('text')
    .attr('x', (d) => d.x + circleRadius + textSpacing)
    .attr('y', (d) => d.y)
    .attr('text-anchor', 'start')
    .attr('dy', '0.3em')
    .attr('font-size', '20')
    .attr('font-weight', 'bold')
    .attr('fill', 'black')
    .style('cursor', 'pointer')
    .text((d) => d.name)
    .on('mouseover', (event, d) => {
      onCircleHover(d.id);
    })
    .on('mouseout', (event, d) => {
      onCircleHover(null);
    })
    .transition()
    .duration(transitionDuration)
    .style('opacity', (d) =>
      hoveredCircleId === null || d.id === hoveredCircleId
        ? 1
        : 0.2,
    );
};

```

**renderColorLegend.js**

```javascript
import { renderCircles } from './renderCircles.js';
import { renderText } from './renderText.js';

export const renderColorLegend = (
  selection,
  {
    colorScale,
    width,
    height,
    hoveredCircleId,
    onCircleHover,
    circleRadius = 30,
    spacingMultiplier = 2.5,
    textSpacing = 15,
  },
) => {
  // Derive legend items from the color scale's domain
  const domainValues = colorScale.domain();

  const spacing = circleRadius * spacingMultiplier;
  const totalHeight = (domainValues.length - 1) * spacing;
  const centerX = width / 2;
  const startY = (height - totalHeight) / 2;

  // Create legend items with positions derived from the scale
  const legendItemsWithPositions = domainValues.map(
    (name, index) => ({
      id: index,
      name,
      x: centerX,
      y: startY + index * spacing,
    }),
  );

  renderCircles(selection, {
    data: legendItemsWithPositions,
    hoveredCircleId,
    textSpacing,
    onCircleHover,
    colorScale,
    circleRadius,
  });

  renderText(selection, {
    data: legendItemsWithPositions,
    hoveredCircleId,
    textSpacing,
    onCircleHover,
    colorScale,
    circleRadius,
  });
};

```

**colorScale.js**

```javascript
import { scaleOrdinal } from 'd3';

export const createColorScale = () =>
  scaleOrdinal()
    .domain(['A', 'B', 'C', 'D', 'E'])
    .range([
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
    ]);

```















Another:

**package.json**

```
{
  "dependencies": {
    "d3": "7.8.5"
  },
  "vizhub": {
    "libraries": {
      "d3": {
        "global": "d3",
        "path": "/dist/d3.min.js"
      }
    }
  }
}

```

**axes.js**

```javascript
import { axisLeft, axisBottom } from 'd3';

export const axes = (
  selection,
  {
    xScale,
    yScale,
    xAxisLabel,
    yAxisLabel,
    xAxisLabelOffset = 25,
    yAxisLabelOffset = 30,
  },
) => {
  selection
    .selectAll('g.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${xScale.range()[0]},0)`)
    .call(axisLeft(yScale))
    .selectAll('text')
    .attr('font-size', 14);

  selection
    .selectAll('g.x-axis')
    .data([null])
    .join('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${yScale.range()[0]})`)
    .call(axisBottom(xScale))
    .selectAll('text')
    .attr('font-size', 14);

  selection
    .selectAll('text.x-axis-label')
    .data([null])
    .join('text')
    .attr('x', (xScale.range()[0] + xScale.range()[1]) / 2)
    .attr('y', yScale.range()[0] + xAxisLabelOffset)
    .attr('class', 'x-axis-label')
    .attr('alignment-baseline', 'hanging')
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .text(xAxisLabel);

  selection
    .selectAll('text.y-axis-label')
    .data([null])
    .join('text')
    .attr('class', 'y-axis-label')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr('font-family', 'sans-serif')
    .attr('x', -(yScale.range()[0] + yScale.range()[1]) / 2)
    .attr('y', xScale.range()[0] - yAxisLabelOffset)
    .text(yAxisLabel);
};

```

**README.md**

```
A scatter plot of
[the Iris Dataset](https://gist.github.com/curran/a08a1080b88344b0c8a7)
with a color legend.

Hover on the color legend to highlight the marks that match!

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/VX0pH6hfIXU?si=nZegEzY5BYgu6ZEI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-wri

See also:

- [selection.join](https://github.com/d3/d3-selection#selection_join)
- [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic)
- [ColorBrewer](https://colorbrewer2.org/)

```

**index.js**

```javascript
import { csvParse, select } from 'd3';
import { scatterPlot } from './scatterPlot';
import { data } from '@curran/iris-dataset';

export const main = (container, { state, setState }) => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = select(container)
    .selectAll('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height);

  const { hoveredValue } = state;

  const setHoveredValue = (d) => {
    setState((state) => ({
      ...state,
      hoveredValue: d,
    }));
  };

  svg.call(scatterPlot, {
    data,
    width,
    height,
    xValue: (d) => d.sepal_length,
    yValue: (d) => d.petal_length,
    colorValue: (d) => d.species,
    xAxisLabel: 'Sepal Length',
    yAxisLabel: 'Petal Length',
    colorLegendLabel: 'Species',
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
    colorLegendX: 850,
    colorLegendY: 320,
    setHoveredValue,
    hoveredValue,
  });
};

```

**scatterPlot.js**

```javascript
import {
  extent,
  scaleLinear,
  scaleOrdinal,
  schemeCategory10,
} from 'd3';
import { axes } from './axes';
import { colorLegend } from './colorLegend';

export const scatterPlot = (
  selection,
  {
    data,
    width,
    height,
    xValue,
    yValue,
    colorValue,
    margin,
    xAxisLabel,
    yAxisLabel,
    colorLegendLabel,
    colorLegendX,
    colorLegendY,
    setHoveredValue,
    hoveredValue,
  }
) => {
  const xScale = scaleLinear()
    .domain(extent(data, xValue))
    .range([margin.left, width - margin.right]);

  const yScale = scaleLinear()
    .domain(extent(data, yValue))
    .range([height - margin.bottom, margin.top]);

  const colorScale = scaleOrdinal()
    .domain(data.map(colorValue))
    .range(schemeCategory10);

  selection.call(axes, {
    xScale,
    yScale,
    xAxisLabel,
    yAxisLabel,
  });

  selection.call(colorLegend, {
    colorScale,
    colorLegendLabel,
    colorLegendX,
    colorLegendY,
    setHoveredValue,
    hoveredValue,
  });

  selection
    .selectAll('circle.mark')
    .data(data)
    .join('circle')
    .attr('class', 'mark')
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('fill', (d) =>
      colorScale(colorValue(d))
    )
    .attr('r', 10)
    .attr('opacity', (d) =>
      hoveredValue
        ? colorValue(d) === hoveredValue
          ? 1
          : 0.2
        : 1
    );
};

```

**colorLegend.js**

```javascript
export const colorLegend = (
  selection,
  {
    colorScale,
    colorLegendLabel,
    colorLegendX,
    colorLegendY,
    tickSpacing = 30,
    tickPadding = 15,
    colorLegendLabelX = -10,
    colorLegendLabelY = -24,
    setHoveredValue,
    hoveredValue,
  },
) => {
  const colorLegendG = selection
    .selectAll('g.color-legend')
    .data([null])
    .join('g')
    .attr('class', 'color-legend')
    .attr(
      'transform',
      `translate(${colorLegendX},${colorLegendY})`,
    );

  colorLegendG
    .selectAll('text.color-legend-label')
    .data([null])
    .join('text')
    .attr('x', colorLegendLabelX)
    .attr('y', colorLegendLabelY)
    .attr('class', 'color-legend-label')
    .attr('font-family', 'sans-serif')
    .text(colorLegendLabel);

  colorLegendG
    .selectAll('g.tick')
    .data(colorScale.domain())
    .join((enter) =>
      enter
        .append('g')
        .attr('class', 'tick')
        .call((selection) => {
          selection.append('circle');
          selection.append('text');
        }),
    )
    .attr(
      'transform',
      (d, i) => `translate(0, ${i * tickSpacing})`,
    )
    .attr('font-size', 14)
    .attr('font-family', 'sans-serif')
    .call((selection) => {
      selection
        .select('circle')
        .attr('r', 10)
        .attr('fill', colorScale);
      selection
        .select('text')
        .attr('dy', '0.32em')
        .attr('x', tickPadding)
        .style('user-select', 'none')
        .text((d) => d);
    })
    .attr('opacity', (d) =>
      hoveredValue ? (d === hoveredValue ? 1 : 0.2) : 1,
    )
    .on('mouseover', (event, d) => {
      setHoveredValue(d);
    })
    .on('mouseout', () => {
      setHoveredValue(null);
    });
};

```