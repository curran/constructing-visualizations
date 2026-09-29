Using the example creation skill, create the next example in the sequence after Interactive Color Legend and call it Scatter Plot with Menus. Start by making a copy of the example number 8 scatter plot, the basic scatter plot, and change it around so that there are menus on the top for controlling the X and Y. Use the following reference example for guidance around the layout and how to set up the menus. Also be sure to pull in the fancy delay animation from this reference example, but do not pull in any of the fancy styling changes. We want the styling to be simple.

The reference example:

**index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Iris Data Explorer</title>
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
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossorigin
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        background: #0a0a0f;
      }

      svg {
        position: absolute;
      }

      .axis-label {
        text-anchor: middle;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 13px;
        font-weight: 500;
        fill: rgba(255, 255, 255, 0.7);
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .x-axis,
      .y-axis {
        color: rgba(255, 255, 255, 0.15);
      }

      .x-axis text,
      .y-axis text {
        fill: rgba(255, 255, 255, 0.4);
        font-size: 11px;
        font-family: 'Inter', sans-serif;
      }

      .x-axis line,
      .y-axis line,
      .x-axis path,
      .y-axis path {
        stroke: rgba(255, 255, 255, 0.1);
      }

      .tooltip {
        position: absolute;
        background: linear-gradient(
          135deg,
          rgba(20, 20, 30, 0.95) 0%,
          rgba(30, 30, 45, 0.95) 100%
        );
        color: rgba(255, 255, 255, 0.9);
        padding: 16px 20px;
        border-radius: 16px;
        font-size: 13px;
        pointer-events: none;
        z-index: 1000;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow:
          0 4px 24px rgba(0, 0, 0, 0.4),
          0 0 40px rgba(139, 92, 246, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        opacity: 0;
        transition: opacity 0.25s
          cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 280px;
        backdrop-filter: blur(20px);
        font-family: 'Inter', sans-serif;
      }

      .tooltip.visible {
        opacity: 1;
      }

      .tooltip-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 8px;
      }

      .tooltip-row:last-child {
        margin-bottom: 0;
      }

      .tooltip-label {
        color: rgba(255, 255, 255, 0.5);
        font-weight: 500;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tooltip-value {
        color: rgba(255, 255, 255, 0.95);
        font-weight: 600;
        font-family: 'Space Grotesk', sans-serif;
      }

      @keyframes pulse-glow {
        0%,
        100% {
          filter: drop-shadow(0 0 8px currentColor);
        }
        50% {
          filter: drop-shadow(0 0 16px currentColor);
        }
      }

      .chart-glow {
        filter: url(#glow);
      }
    </style>
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
import { createRoot } from 'react-dom/client';
import App from './App';
import { InteractionProvider } from './contexts/InteractionContext';

const root = createRoot(document.getElementById('root'));
root.render(
  <InteractionProvider>
    <App />
  </InteractionProvider>,
);

```

**App.jsx**

```
import Layout from './components/Layout/Layout';
import HeaderTitleTagline from './components/Layout/HeaderTitleTagline';
import LayoutMainContent from './components/Layout/LayoutMainContent';
import Chart from './components/Chart/Chart';

const App = () => {
  return (
    <Layout
      header={
        <HeaderTitleTagline
          title="Iris Data Explorer"
          tagline="Elegant visualization of botanical measurements"
        />
      }
      mainContent={
        <LayoutMainContent className="flex flex-row gap-4 h-full">
          <div className="flex-1 min-w-0">
            <Chart />
          </div>
        </LayoutMainContent>
      }
    />
  );
};

export default App;

```

**components/Layout/LayoutMainContent.jsx**

```
export default function LayoutMainContent({
  children,
  className = '',
}) {
  return (
    <div
      className={`flex-1 flex flex-col p-6 min-h-0 ${className}`}
    >
      {children}
    </div>
  );
}

```

**components/Layout/Layout.jsx**

```
export default function Layout({ header, mainContent }) {
  return (
    <div className="h-screen bg-[#0a0a0f] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-pink-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {header && (
          <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/5 backdrop-blur-sm">
            {header}
          </header>
        )}

        {mainContent && (
          <main className="flex-1 flex flex-col overflow-y-auto min-h-0">
            {mainContent}
          </main>
        )}
      </div>
    </div>
  );
}

```

**components/Chart/Chart.jsx**

```
import useData from '../../hooks/useData';
import ChartBase from './ChartBase';
import { useInteraction } from '../../hooks/useInteraction';
import { getColumnConfig } from '../../config';

const Chart = () => {
  const { data, loading, error } = useData();
  const {
    xEncoding,
    yEncoding,
    colorEncoding,
    sizeEncoding,
  } = useInteraction();

  if (loading) {
    return (
      <div className="w-full h-full bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">
            Loading data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-red-500/20 flex items-center justify-center">
        <p className="text-red-400/80">Error: {error}</p>
      </div>
    );
  }

  const xConfig = getColumnConfig(xEncoding);
  const yConfig = getColumnConfig(yEncoding);
  const colorConfig =
    colorEncoding !== 'none'
      ? getColumnConfig(colorEncoding)
      : null;
  const sizeConfig =
    sizeEncoding !== 'none'
      ? getColumnConfig(sizeEncoding)
      : null;

  return (
    <ChartBase
      data={data}
      xValue={xConfig.accessor}
      yValue={yConfig.accessor}
      colorValue={colorConfig ? colorConfig.accessor : null}
      colorEncoding={colorEncoding}
      sizeValue={sizeConfig ? sizeConfig.accessor : null}
      sizeEncoding={sizeEncoding}
      xAxisLabel={xConfig.label}
      yAxisLabel={yConfig.label}
      colorAxisLabel={
        colorConfig ? colorConfig.label : null
      }
      sizeAxisLabel={sizeConfig ? sizeConfig.label : null}
    />
  );
};

export default Chart;

```

**components/Chart/renderCircles.js**

```javascript
import { easeCubicOut } from 'd3';
import { createScales } from './createScales';
import { getColorScale } from './getColorScale';
import { getSizeScale } from './getSizeScale';
import { renderAxes } from './renderAxes';
import { renderDefs } from './renderDefs';
import { createTooltip } from './createTooltip';
import {
  CHART_CONFIG,
  ANIMATION_CONFIG,
  COLORS,
} from '../../config';

export const renderCircles = (
  selection,
  {
    data,
    selectedId,
    onClick,
    width,
    height,
    xValue,
    yValue,
    colorValue,
    colorEncoding,
    sizeValue,
    sizeEncoding,
    xAxisLabel,
    yAxisLabel,
    colorAxisLabel,
    sizeAxisLabel,
    margin = CHART_CONFIG.margin,
    xAxisLabelOffset = CHART_CONFIG.xAxisLabelOffset,
    yAxisLabelOffset = CHART_CONFIG.yAxisLabelOffset,
  },
) => {
  const { xScale, yScale } = createScales({
    data,
    width,
    height,
    margin,
    xValue,
    yValue,
  });

  const colorScale = getColorScale(
    data,
    colorValue,
    colorEncoding,
  );

  const sizeScale = getSizeScale(data, sizeValue);

  // Render gradient and glow definitions
  renderDefs(selection, data, colorValue, colorScale);

  // Create tooltip once
  const svgElement = selection.node();
  const container = svgElement.parentElement;
  const tooltip = createTooltip(container);

  const formatTooltip = (d) => {
    const xVal = xValue(d).toFixed(2);
    const yVal = yValue(d).toFixed(2);
    const colorVal = colorValue ? colorValue(d) : null;
    const sizeVal = sizeValue
      ? sizeValue(d).toFixed(2)
      : null;

    return `
      <div class="tooltip-row">
        <span class="tooltip-label">${xAxisLabel}:</span>
        <span class="tooltip-value">${xVal}</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">${yAxisLabel}:</span>
        <span class="tooltip-value">${yVal}</span>
      </div>
      ${
        colorVal && colorAxisLabel
          ? `
        <div class="tooltip-row">
          <span class="tooltip-label">${colorAxisLabel}:</span>
          <span class="tooltip-value">${colorVal}</span>
        </div>
      `
          : ''
      }
      ${
        sizeVal && sizeAxisLabel
          ? `
        <div class="tooltip-row">
          <span class="tooltip-label">${sizeAxisLabel}:</span>
          <span class="tooltip-value">${sizeVal}</span>
        </div>
      `
          : ''
      }
    `;
  };

  const delayPerItem =
    ANIMATION_CONFIG.circleStaggerMaxDelay /
    Math.max(data.length, 1);

  selection
    .selectAll('circle')
    .data(data, (d) => d.id)
    .join('circle')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation();
      onClick(d.id === selectedId ? null : d.id);
    })
    .on('pointerenter', (event, d) => {
      tooltip.show(
        event.pageX,
        event.pageY,
        formatTooltip(d),
      );
    })
    .on('pointermove', (event) => {
      const tooltipNode = tooltip.selection.node();
      if (!tooltipNode) return;

      const rect = tooltipNode.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 15;

      let x = event.pageX + padding;
      let y = event.pageY - rect.height - padding;

      if (x + rect.width > viewportWidth) {
        x = event.pageX - rect.width - padding;
      }

      if (y < 0) {
        y = event.pageY + padding;
      }

      tooltip.selection
        .style('left', `${x}px`)
        .style('top', `${y}px`);
    })
    .on('pointerleave', () => {
      tooltip.hide();
    })
    .transition()
    .delay((d, i) => i * delayPerItem)
    .duration(ANIMATION_CONFIG.circleDuration)
    .ease(easeCubicOut)
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('r', (d) =>
      sizeScale(sizeValue ? sizeValue(d) : 1),
    )
    .attr('fill', (d) => {
      if (d.id === selectedId) {
        return COLORS.circleSelected;
      }
      if (colorValue) {
        return `url(#gradient-${d.id})`;
      }
      return `url(#gradient-default)`;
    })
    .attr('stroke', (d) =>
      d.id === selectedId
        ? COLORS.circleStrokeSelected
        : COLORS.circleStroke,
    )
    .attr('stroke-width', (d) =>
      d.id === selectedId
        ? COLORS.circleStrokeWidthSelected
        : COLORS.circleStrokeWidth,
    )
    .attr('opacity', CHART_CONFIG.circleOpacity)
    .attr('filter', (d) =>
      d.id === selectedId
        ? 'url(#glow-selected)'
        : 'url(#glow)',
    );

  renderAxes(selection, {
    xScale,
    yScale,
    width,
    height,
    margin,
    xAxisLabel,
    yAxisLabel,
    xAxisLabelOffset,
    yAxisLabelOffset,
  });
};

```

**hooks/useChartDimensions.js**

```javascript
import { useEffect, useState } from 'react';

const useChartDimensions = (containerRef) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return dimensions;
};

export default useChartDimensions;

```

**components/Chart/ChartBase.jsx**

```
import { useRef, useEffect } from 'react';
import { select } from 'd3';
import useChartDimensions from '../../hooks/useChartDimensions';
import { useInteraction } from '../../hooks/useInteraction';
import { renderCircles } from './renderCircles';

const ChartBase = ({
  data,
  xValue,
  yValue,
  colorValue,
  colorEncoding,
  sizeValue,
  sizeEncoding,
  xAxisLabel,
  yAxisLabel,
  colorAxisLabel,
  sizeAxisLabel,
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dimensions = useChartDimensions(containerRef);
  const { selectedId, setSelectedId } = useInteraction();

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0)
      return;
    if (data.length === 0) return;

    const svg = select(svgRef.current);
    svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    svg.on('click', function (event) {
      if (event.target === this) {
        setSelectedId(null);
      }
    });

    renderCircles(svg, {
      data,
      selectedId,
      onClick: setSelectedId,
      width: dimensions.width,
      height: dimensions.height,
      xValue,
      yValue,
      colorValue,
      colorEncoding,
      sizeValue,
      sizeEncoding,
      xAxisLabel,
      yAxisLabel,
      colorAxisLabel,
      sizeAxisLabel,
    });
  }, [
    selectedId,
    dimensions,
    data,
    setSelectedId,
    xValue,
    yValue,
    colorValue,
    colorEncoding,
    sizeValue,
    sizeEncoding,
    xAxisLabel,
    yAxisLabel,
    colorAxisLabel,
    sizeAxisLabel,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 relative overflow-hidden"
      style={{
        boxShadow: `
          0 4px 24px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <svg
        ref={svgRef}
        className="w-full h-full relative z-10"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default ChartBase;

```

**components/Layout/HeaderTitleTagline.jsx**

```
import { useInteraction } from '../../hooks/useInteraction';
import {
  COLUMN_OPTIONS,
  COLOR_ENCODING_OPTIONS,
  SIZE_ENCODING_OPTIONS,
} from '../../config';

const SelectDropdown = ({
  label,
  value,
  onChange,
  options,
  title,
}) => (
  <div className="flex flex-col gap-1.5 group">
    <label
      className="text-[10px] font-semibold text-white/40 cursor-help uppercase tracking-wider"
      title={title}
    >
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/90 
                 focus:outline-none focus:border-purple-500/50 focus:bg-white/8
                 cursor-pointer hover:border-white/20 hover:bg-white/8
                 transition-all duration-300 backdrop-blur-sm
                 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%20
                 bg-[position:right_12px_center] bg-no-repeat pr-10"
      title={title}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-[#1a1a2e] text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default function HeaderTitleTagline({
  title,
  tagline,
}) {
  const {
    xEncoding,
    setXEncoding,
    yEncoding,
    setYEncoding,
    colorEncoding,
    setColorEncoding,
    sizeEncoding,
    setSizeEncoding,
  } = useInteraction();

  return (
    <div className="flex flex-col w-full py-2 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {title}
          </h1>
          <p className="text-sm text-white/40 font-light tracking-wide">
            {tagline}
          </p>
        </div>
        <div className="flex gap-4 items-end">
          <SelectDropdown
            label="X Axis"
            value={xEncoding}
            onChange={(e) => setXEncoding(e.target.value)}
            options={COLUMN_OPTIONS}
            title="Select the column to display on the X axis"
          />
          <SelectDropdown
            label="Y Axis"
            value={yEncoding}
            onChange={(e) => setYEncoding(e.target.value)}
            options={COLUMN_OPTIONS}
            title="Select the column to display on the Y axis"
          />
          <SelectDropdown
            label="Color"
            value={colorEncoding}
            onChange={(e) =>
              setColorEncoding(e.target.value)
            }
            options={COLOR_ENCODING_OPTIONS}
            title="Select the column to use for coloring"
          />
          <SelectDropdown
            label="Size"
            value={sizeEncoding}
            onChange={(e) =>
              setSizeEncoding(e.target.value)
            }
            options={SIZE_ENCODING_OPTIONS}
            title="Select the column to encode as circle size"
          />
        </div>
      </div>
    </div>
  );
}

```

**contexts/InteractionContext.jsx**

```
import { createContext, useState } from 'react';
import { DEFAULT_ENCODING } from '../config';

export const InteractionContext = createContext();

export const InteractionProvider = ({ children }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [xEncoding, setXEncoding] = useState(
    DEFAULT_ENCODING.x,
  );
  const [yEncoding, setYEncoding] = useState(
    DEFAULT_ENCODING.y,
  );
  const [colorEncoding, setColorEncoding] = useState(
    DEFAULT_ENCODING.color,
  );
  const [sizeEncoding, setSizeEncoding] = useState(
    DEFAULT_ENCODING.size,
  );

  return (
    <InteractionContext.Provider
      value={{
        selectedId,
        setSelectedId,
        xEncoding,
        setXEncoding,
        yEncoding,
        setYEncoding,
        colorEncoding,
        setColorEncoding,
        sizeEncoding,
        setSizeEncoding,
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
};

```

**hooks/useInteraction.js**

```javascript
import { useContext } from 'react';
import { InteractionContext } from '../contexts/InteractionContext';

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error(
      'useInteraction must be used within an InteractionProvider',
    );
  }
  return context;
};

```

**hooks/useData.js**

```javascript
import { useState, useEffect } from 'react';
import { csv } from 'd3';
import { DATA_CONFIG } from '../config';

const useData = (csvPath = DATA_CONFIG.csvPath) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    csv(csvPath)
      .then((loadedData) => {
        const parsedData = loadedData.map((d, i) => ({
          id: i,
          sepal_length: +d.sepal_length,
          sepal_width: +d.sepal_width,
          petal_length: +d.petal_length,
          petal_width: +d.petal_width,
          species: d.species,
        }));
        setData(parsedData);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [csvPath]);

  return { data, loading, error };
};

export default useData;

```

**data.csv**

```
sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
4.6,3.1,1.5,0.2,setosa
5.0,3.6,1.4,0.2,setosa
5.4,3.9,1.7,0.4,setosa
4.6,3.4,1.4,0.3,setosa
5.0,3.4,1.5,0.2,setosa
4.4,2.9,1.4,0.2,setosa
4.9,3.1,1.5,0.1,setosa
5.4,3.7,1.5,0.2,setosa
4.8,3.4,1.6,0.2,setosa
4.8,3.0,1.4,0.1,setosa
4.3,3.0,1.1,0.1,setosa
5.8,4.0,1.2,0.2,setosa
5.7,4.4,1.5,0.4,setosa
5.4,3.9,1.3,0.4,setosa
5.1,3.5,1.4,0.3,setosa
5.7,3.8,1.7,0.3,setosa
5.1,3.8,1.5,0.3,setosa
5.4,3.4,1.7,0.2,setosa
5.1,3.7,1.5,0.4,setosa
4.6,3.6,1.0,0.2,setosa
5.1,3.3,1.7,0.5,setosa
4.8,3.4,1.9,0.2,setosa
5.0,3.0,1.6,0.2,setosa
5.0,3.4,1.6,0.4,setosa
5.2,3.5,1.5,0.2,setosa
5.2,3.4,1.4,0.2,setosa
4.7,3.2,1.6,0.2,setosa
4.8,3.1,1.6,0.2,setosa
5.4,3.4,1.5,0.4,setosa
5.2,4.1,1.5,0.1,setosa
5.5,4.2,1.4,0.2,setosa
4.9,3.1,1.5,0.1,setosa
5.0,3.2,1.2,0.2,setosa
5.5,3.5,1.3,0.2,setosa
4.9,3.1,1.5,0.1,setosa
4.4,3.0,1.3,0.2,setosa
5.1,3.4,1.5,0.2,setosa
5.0,3.5,1.3,0.3,setosa
4.5,2.3,1.3,0.3,setosa
4.4,3.2,1.3,0.2,setosa
5.0,3.5,1.6,0.6,setosa
5.1,3.8,1.9,0.4,setosa
4.8,3.0,1.4,0.3,setosa
5.1,3.8,1.6,0.2,setosa
4.6,3.2,1.4,0.2,setosa
5.3,3.7,1.5,0.2,setosa
```

**components/Chart/renderAxisLabels.js**

```javascript
import { easeCubicOut } from 'd3';
import { ANIMATION_CONFIG } from '../../config';

export const renderAxisLabels = (
  selection,
  {
    width,
    height,
    xAxisLabel,
    yAxisLabel,
    xAxisLabelOffset,
    yAxisLabelOffset,
  },
) => {
  selection
    .selectAll('.x-axis-label')
    .data([null])
    .join('text')
    .attr('class', 'x-axis-label axis-label')
    .attr('x', width / 2)
    .attr('y', height - xAxisLabelOffset)
    .transition()
    .delay(ANIMATION_CONFIG.labelTransitionDelay)
    .duration(ANIMATION_CONFIG.labelTransitionDuration / 2)
    .style('opacity', 0)
    .transition()
    .duration(0)
    .text(xAxisLabel)
    .transition()
    .duration(ANIMATION_CONFIG.labelTransitionDuration / 2)
    .ease(easeCubicOut)
    .style('opacity', 1);

  selection
    .selectAll('.y-axis-label')
    .data([null])
    .join('text')
    .attr('class', 'y-axis-label axis-label')
    .attr('x', -height / 2)
    .attr('y', yAxisLabelOffset)
    .attr('transform', 'rotate(-90)')
    .transition()
    .delay(ANIMATION_CONFIG.labelTransitionDelay + 50)
    .duration(ANIMATION_CONFIG.labelTransitionDuration / 2)
    .style('opacity', 0)
    .transition()
    .duration(0)
    .text(yAxisLabel)
    .transition()
    .duration(ANIMATION_CONFIG.labelTransitionDuration / 2)
    .ease(easeCubicOut)
    .style('opacity', 1);
};

```

**components/Chart/createScales.js**

```javascript
import { scaleLinear, extent } from 'd3';

export const createScales = ({
  data,
  width,
  height,
  margin,
  xValue,
  yValue,
}) => {
  const xExtent = extent(data, xValue);
  const yExtent = extent(data, yValue);

  // Add some padding to the domains
  const xPadding = (xExtent[1] - xExtent[0]) * 0.05;
  const yPadding = (yExtent[1] - yExtent[0]) * 0.05;

  const xScale = scaleLinear()
    .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
    .range([margin.left, width - margin.right]);

  const yScale = scaleLinear()
    .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
    .range([height - margin.bottom, margin.top]);

  return { xScale, yScale };
};

```

**components/Chart/renderAxes.js**

```javascript
import { axisBottom, axisLeft, easeCubicOut } from 'd3';
import { renderAxisLabels } from './renderAxisLabels';
import { ANIMATION_CONFIG } from '../../config';

export const renderAxes = (
  selection,
  {
    xScale,
    yScale,
    width,
    height,
    margin,
    xAxisLabel,
    yAxisLabel,
    xAxisLabelOffset = 10,
    yAxisLabelOffset = 20,
  },
) => {
  const xAxis = axisBottom(xScale)
    .ticks(6)
    .tickSize(-height + margin.top + margin.bottom)
    .tickPadding(10);

  const xAxisGroup = selection
    .selectAll('.x-axis')
    .data([null])
    .join('g')
    .attr('class', 'x-axis')
    .attr(
      'transform',
      `translate(0,${height - margin.bottom})`,
    );

  xAxisGroup
    .transition()
    .delay(ANIMATION_CONFIG.axisTransitionDelay)
    .duration(ANIMATION_CONFIG.axisTransitionDuration)
    .ease(easeCubicOut)
    .call(xAxis);

  // Style grid lines
  xAxisGroup
    .selectAll('line')
    .attr('stroke', 'rgba(255, 255, 255, 0.05)')
    .attr('stroke-dasharray', '4,4');

  xAxisGroup
    .select('.domain')
    .attr('stroke', 'rgba(255, 255, 255, 0.1)');

  const yAxis = axisLeft(yScale)
    .ticks(6)
    .tickSize(-width + margin.left + margin.right)
    .tickPadding(10);

  const yAxisGroup = selection
    .selectAll('.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left},0)`);

  yAxisGroup
    .transition()
    .delay(ANIMATION_CONFIG.axisTransitionDelay)
    .duration(ANIMATION_CONFIG.axisTransitionDuration)
    .ease(easeCubicOut)
    .call(yAxis);

  // Style grid lines
  yAxisGroup
    .selectAll('line')
    .attr('stroke', 'rgba(255, 255, 255, 0.05)')
    .attr('stroke-dasharray', '4,4');

  yAxisGroup
    .select('.domain')
    .attr('stroke', 'rgba(255, 255, 255, 0.1)');

  renderAxisLabels(selection, {
    width,
    height,
    xAxisLabel,
    yAxisLabel,
    xAxisLabelOffset,
    yAxisLabelOffset,
  });
};

```

**config.js**

```javascript
/**
 * config.js - Centralized configuration for the dashboard
 */

export const COLUMN_TYPES = {
  QUANTITATIVE: 'quantitative',
  CATEGORICAL: 'categorical',
};

export const COLUMNS = {
  sepal_length: {
    value: 'sepal_length',
    label: 'Sepal Length',
    type: COLUMN_TYPES.QUANTITATIVE,
    accessor: (d) => d.sepal_length,
  },
  sepal_width: {
    value: 'sepal_width',
    label: 'Sepal Width',
    type: COLUMN_TYPES.QUANTITATIVE,
    accessor: (d) => d.sepal_width,
  },
  petal_length: {
    value: 'petal_length',
    label: 'Petal Length',
    type: COLUMN_TYPES.QUANTITATIVE,
    accessor: (d) => d.petal_length,
  },
  petal_width: {
    value: 'petal_width',
    label: 'Petal Width',
    type: COLUMN_TYPES.QUANTITATIVE,
    accessor: (d) => d.petal_width,
  },
  species: {
    value: 'species',
    label: 'Species',
    type: COLUMN_TYPES.CATEGORICAL,
    accessor: (d) => d.species,
  },
};

export const COLUMN_OPTIONS = Object.values(COLUMNS)
  .filter((col) => col.type === COLUMN_TYPES.QUANTITATIVE)
  .map((col) => ({
    value: col.value,
    label: col.label,
  }));

export const COLOR_ENCODING_OPTIONS = [
  { value: 'none', label: 'None' },
  ...Object.values(COLUMNS).map((col) => ({
    value: col.value,
    label: col.label,
  })),
];

export const SIZE_ENCODING_OPTIONS = [
  { value: 'none', label: 'None' },
  ...Object.values(COLUMNS)
    .filter((col) => col.type === COLUMN_TYPES.QUANTITATIVE)
    .map((col) => ({
      value: col.value,
      label: col.label,
    })),
];

export const DEFAULT_ENCODING = {
  x: 'sepal_length',
  y: 'sepal_width',
  color: 'species',
  size: 'petal_length',
};

export const DATA_CONFIG = {
  csvPath: './data.csv',
  idKey: 'id',
  fields: [
    'sepal_length',
    'sepal_width',
    'petal_length',
    'petal_width',
    'species',
  ],
};

export const CHART_CONFIG = {
  margin: {
    top: 40,
    right: 60,
    bottom: 70,
    left: 80,
  },
  circleRadiusMin: 6,
  circleRadiusMax: 24,
  circleRadiusDefault: 12,
  circleOpacity: 0.85,
  xAxisLabelOffset: 15,
  yAxisLabelOffset: 35,
};

export const ANIMATION_CONFIG = {
  circleStaggerMaxDelay: 500,
  circleDuration: 800,
  axisTransitionDelay: 100,
  axisTransitionDuration: 600,
  labelTransitionDelay: 200,
  labelTransitionDuration: 500,
};

export const COLORS = {
  circle: '#8b5cf6',
  circleSelected: '#ffffff',
  circleStroke: 'rgba(255, 255, 255, 0.3)',
  circleStrokeSelected: '#8b5cf6',
  circleStrokeWidthSelected: 3,
  circleStrokeWidth: 1,
};

// Beautiful gradient color palette
export const COLOR_SCALE_PALETTE = [
  '#f472b6', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
];

export const CATEGORICAL_COLOR_PALETTE = {
  setosa: '#f472b6',
  versicolor: '#8b5cf6',
  virginica: '#06b6d4',
};

export const getColumnConfig = (columnKey) => {
  return COLUMNS[columnKey] || COLUMNS[DEFAULT_ENCODING.x];
};

```

**components/Chart/getColorScale.js**

```javascript
import { scaleLinear, scaleOrdinal, extent } from 'd3';
import {
  COLOR_SCALE_PALETTE,
  CATEGORICAL_COLOR_PALETTE,
  getColumnConfig,
  COLUMN_TYPES,
} from '../../config';

export const getColorScale = (
  data,
  colorValue,
  colorEncoding,
) => {
  if (!colorValue) {
    return () => '#8b5cf6';
  }

  const columnConfig = getColumnConfig(colorEncoding);

  if (columnConfig.type === COLUMN_TYPES.CATEGORICAL) {
    const uniqueValues = [...new Set(data.map(colorValue))];

    // Use predefined palette if available
    if (colorEncoding === 'species') {
      return (value) =>
        CATEGORICAL_COLOR_PALETTE[value] ||
        COLOR_SCALE_PALETTE[0];
    }

    return scaleOrdinal()
      .domain(uniqueValues)
      .range(COLOR_SCALE_PALETTE);
  }

  const values = data.map(colorValue);
  const [min, max] = extent(values);

  // Create a beautiful gradient scale
  return scaleLinear()
    .domain([min, (min + max) / 2, max])
    .range(['#f472b6', '#8b5cf6', '#06b6d4']);
};

```

**components/Chart/createTooltip.js**

```javascript
import { select } from 'd3';

export const createTooltip = (container) => {
  // Remove existing tooltips
  select(container).selectAll('.tooltip').remove();

  const tooltip = select(container)
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000);

  return {
    selection: tooltip,
    show(x, y, content) {
      const rect = tooltip.node().getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 15;

      let finalX = x + padding;
      let finalY = y - rect.height - padding;

      if (finalX + rect.width > viewportWidth) {
        finalX = x - rect.width - padding;
      }

      if (finalY < 0) {
        finalY = y + padding;
      }

      tooltip
        .style('left', `${finalX}px`)
        .style('top', `${finalY}px`)
        .html(content)
        .style('opacity', 1);
    },
    hide() {
      tooltip.style('opacity', 0);
    },
    remove() {
      tooltip.remove();
    },
  };
};

```

**components/Chart/renderDefs.js**

```javascript
import {
  CATEGORICAL_COLOR_PALETTE,
  COLORS,
} from '../../config';

export const renderDefs = (
  selection,
  data,
  colorValue,
  colorScale,
) => {
  // Remove existing defs
  selection.selectAll('defs').remove();

  const defs = selection.append('defs');

  // Create glow filter
  const glowFilter = defs
    .append('filter')
    .attr('id', 'glow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  glowFilter
    .append('feGaussianBlur')
    .attr('stdDeviation', '4')
    .attr('result', 'coloredBlur');

  const glowMerge = glowFilter.append('feMerge');
  glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
  glowMerge
    .append('feMergeNode')
    .attr('in', 'SourceGraphic');

  // Create selected glow filter (stronger)
  const glowSelectedFilter = defs
    .append('filter')
    .attr('id', 'glow-selected')
    .attr('x', '-100%')
    .attr('y', '-100%')
    .attr('width', '300%')
    .attr('height', '300%');

  glowSelectedFilter
    .append('feGaussianBlur')
    .attr('stdDeviation', '8')
    .attr('result', 'coloredBlur');

  const glowSelectedMerge =
    glowSelectedFilter.append('feMerge');
  glowSelectedMerge
    .append('feMergeNode')
    .attr('in', 'coloredBlur');
  glowSelectedMerge
    .append('feMergeNode')
    .attr('in', 'SourceGraphic');

  // Create gradients for each data point
  data.forEach((d) => {
    const baseColor = colorValue
      ? colorScale(colorValue(d))
      : COLORS.circle;

    const gradient = defs
      .append('radialGradient')
      .attr('id', `gradient-${d.id}`)
      .attr('cx', '30%')
      .attr('cy', '30%')
      .attr('r', '70%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', lightenColor(baseColor, 40));

    gradient
      .append('stop')
      .attr('offset', '50%')
      .attr('stop-color', baseColor);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', darkenColor(baseColor, 20));
  });

  // Default gradient for when no color encoding
  const defaultGradient = defs
    .append('radialGradient')
    .attr('id', 'gradient-default')
    .attr('cx', '30%')
    .attr('cy', '30%')
    .attr('r', '70%');

  defaultGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', lightenColor(COLORS.circle, 40));

  defaultGradient
    .append('stop')
    .attr('offset', '50%')
    .attr('stop-color', COLORS.circle);

  defaultGradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', darkenColor(COLORS.circle, 20));
};

function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

function darkenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

```

**components/Chart/getSizeScale.js**

```javascript
import { scaleLinear, extent } from 'd3';
import { CHART_CONFIG } from '../../config';

export const getSizeScale = (data, sizeValue) => {
  if (!sizeValue) {
    return () => CHART_CONFIG.circleRadiusDefault;
  }

  const values = data.map(sizeValue);
  const [min, max] = extent(values);

  return scaleLinear()
    .domain([min, max])
    .range([
      CHART_CONFIG.circleRadiusMin,
      CHART_CONFIG.circleRadiusMax,
    ]);
};

```