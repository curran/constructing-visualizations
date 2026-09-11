import { useEffect, useMemo, useRef } from 'react';
import { select } from 'd3-selection';
import { useDimensions } from '../005-responsive-pseudo-scatter-plot/useDimensions';
import { usePenguinsDataset } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import type { Margin } from './margin';
import { useScales } from './useScales';
import { renderCircles } from './renderCircles';
import { renderAxes } from './renderAxes';

// Accessors extract the x and y values from each row of the dataset.
const xValue = (row: PenguinRow) => row.bill_length_mm;
const yValue = (row: PenguinRow) => row.bill_depth_mm;

// Chart configuration. All tweakable values live here in one place so they
// can be adjusted without hunting through the rendering functions.
const margin: Margin = { top: 60, right: 20, bottom: 60, left: 80 };
const title = 'Palmer Penguins';
const titleFontSize = 20;
const xAxisLabel = 'Bill Length (mm)';
const yAxisLabel = 'Bill Depth (mm)';
const axisLabelFontSize = 14;
const xAxisLabelOffset = 40;
const yAxisLabelOffset = 40;

export function ScatterPlot() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const data = usePenguinsDataset();

  // Some rows in the dataset have missing measurements (NA), which would
  // map to undefined circle positions and render as stray dots at the
  // origin. Drop those rows so every remaining row maps to a valid circle.
  const rows = useMemo(
    () =>
      data?.filter(
        (row) => Number.isFinite(row.bill_length_mm) && Number.isFinite(row.bill_depth_mm),
      ) ?? null,
    [data],
  );

  const scales = useScales({ data: rows, ...dimensions, margin, xValue, yValue });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0 || !rows || !scales) return;

    // D3 renders the data-driven marks and axes into the expected groups;
    // the static labels are plain React text elements.
    renderCircles(select(svg).select<SVGGElement>('g.marks'), {
      data: rows,
      xScale: scales.xScale,
      yScale: scales.yScale,
      xValue,
      yValue,
    });

    renderAxes(select(svg).select<SVGGElement>('g.guides'), {
      xScale: scales.xScale,
      yScale: scales.yScale,
    });
  }, [dimensions, rows, scales]);

  // The centers of the plot area define where axis labels are centered.
  const plotCenterX = margin.left + (dimensions.width - margin.left - margin.right) / 2;
  const plotCenterY = margin.top + (dimensions.height - margin.top - margin.bottom) / 2;

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Scatter plot of Palmer Penguins bill length and bill depth"
      >
        <g className="marks" />
        <g className="guides">
          <g className="x-axis" transform={`translate(0, ${dimensions.height - margin.bottom})`} />
          <g className="y-axis" transform={`translate(${margin.left}, 0)`} />
        </g>
        <g className="labels">
          <text
            className="title"
            x={dimensions.width / 2}
            y={margin.top / 2}
            textAnchor="middle"
            fontSize={titleFontSize}
          >
            {title}
          </text>
          <text
            className="x-axis-label"
            x={plotCenterX}
            y={dimensions.height - margin.bottom + xAxisLabelOffset}
            textAnchor="middle"
            fontSize={axisLabelFontSize}
          >
            {xAxisLabel}
          </text>
          <text
            className="y-axis-label"
            transform={`translate(${margin.left - yAxisLabelOffset}, ${plotCenterY}) rotate(-90)`}
            textAnchor="middle"
            fontSize={axisLabelFontSize}
          >
            {yAxisLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}
