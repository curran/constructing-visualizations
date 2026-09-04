import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { useDimensions } from '../005-responsive-pseudo-scatter-plot/useDimensions';
import { usePenguinsDataset } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { useScales } from './useScales';
import { renderCircles } from './renderCircles';

export function ScatterplotBasic() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const data = usePenguinsDataset();
  const { xScale, yScale, xValue, yValue } = useScales({
    data,
    width: dimensions.width,
    height: dimensions.height,
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0 || !data) return;

    renderCircles(select(svg), { data, xScale, yScale, xValue, yValue });
  }, [dimensions, data, xScale, yScale, xValue, yValue]);

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