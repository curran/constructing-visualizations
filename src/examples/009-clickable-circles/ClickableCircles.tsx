import { useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { useDimensions } from './useDimensions';
import { renderCircles } from './renderCircles';
import type { CircleDataPoint } from './renderCircles';

const data: CircleDataPoint[] = [
  { id: 0, x: 132, y: 391 },
  { id: 1, x: 330, y: 349 },
  { id: 2, x: 410, y: 192 },
  { id: 3, x: 527, y: 257 },
  { id: 4, x: 688, y: 119 },
  { id: 5, x: 878, y: 55 },
];

const ORIGINAL_WIDTH = 960;
const ORIGINAL_HEIGHT = 500;

export function ClickableCircles() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);

  // The scales only depend on the measured size, so memoize them to avoid
  // rebuilding them on every render (e.g. each selection change).
  const scales = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return null;
    return {
      xScale: scaleLinear().domain([0, ORIGINAL_WIDTH]).range([0, dimensions.width]),
      yScale: scaleLinear().domain([0, ORIGINAL_HEIGHT]).range([0, dimensions.height]),
    };
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !scales) return;

    renderCircles(select(svg), {
      data,
      xScale: scales.xScale,
      yScale: scales.yScale,
      selectedCircleId,
      setSelectedCircleId,
    });
  }, [scales, selectedCircleId]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Responsive scatter plot showing 6 clickable data points"
      ></svg>
    </div>
  );
}
