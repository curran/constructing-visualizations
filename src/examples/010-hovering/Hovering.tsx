import { useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { useDimensions } from './useDimensions';
import { renderCircles } from './renderCircles';
import { renderVoronoiOverlay } from './renderVoronoiOverlay';
import type { CircleDataPoint } from './renderCircles';

const data: CircleDataPoint[] = [
  { id: 0, x: 132, y: 391 },
  { id: 1, x: 330, y: 349 },
  { id: 2, x: 410, y: 192 },
  { id: 3, x: 527, y: 257 },
  { id: 4, x: 688, y: 119 },
  { id: 5, x: 878, y: 55 },
  { id: 6, x: 210, y: 120 },
  { id: 7, x: 560, y: 420 },
  { id: 8, x: 760, y: 330 },
  { id: 9, x: 880, y: 430 },
];

const ORIGINAL_WIDTH = 960;
const ORIGINAL_HEIGHT = 500;

export function Hovering() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const [hoveredCircleId, setHoveredCircleId] = useState<number | null>(null);
  const [showVoronoi, setShowVoronoi] = useState(false);

  // The scales only depend on the measured size, so memoize them to avoid
  // rebuilding them on every render (e.g. each hover change).
  const scales = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return null;
    return {
      xScale: scaleLinear().domain([0, ORIGINAL_WIDTH]).range([0, dimensions.width]),
      yScale: scaleLinear().domain([0, ORIGINAL_HEIGHT]).range([0, dimensions.height]),
    };
  }, [dimensions.width, dimensions.height]);

  // Easter egg: pressing "V" toggles the Voronoi cell borders on and off.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'v') {
        setShowVoronoi((shown) => !shown);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !scales) return;

    renderCircles(select(svg), {
      data,
      xScale: scales.xScale,
      yScale: scales.yScale,
      hoveredCircleId,
    });

    renderVoronoiOverlay(select(svg), {
      data,
      xScale: scales.xScale,
      yScale: scales.yScale,
      width: dimensions.width,
      height: dimensions.height,
      setHoveredCircleId,
      showVoronoi,
    });
  }, [scales, dimensions.width, dimensions.height, hoveredCircleId, showVoronoi]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Responsive scatter plot showing 10 hoverable data points"
      ></svg>
    </div>
  );
}
