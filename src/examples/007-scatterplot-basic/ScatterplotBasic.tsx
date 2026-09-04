import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { useDimensions } from '../005-responsive-pseudo-scatter-plot/useDimensions';
import { usePenguinsDataset } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { useScales } from './useScales';
import { renderCircles } from './renderCircles';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';

// Accessors extract the x and y values from each row of the dataset.
const xValue = (row: PenguinRow) => row.bill_length_mm;
const yValue = (row: PenguinRow) => row.bill_depth_mm;

export function ScatterplotBasic() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const data = usePenguinsDataset();
  const scales = useScales({ data, ...dimensions, xValue, yValue });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0 || !data || !scales) return;

    renderCircles(select(svg), {
      data,
      xScale: scales.xScale,
      yScale: scales.yScale,
      xValue,
      yValue,
    });
  }, [dimensions, data, scales]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Scatter plot of penguin bill length and bill depth"
      ></svg>
    </div>
  );
}
