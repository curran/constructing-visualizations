import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { useDimensions } from './useDimensions';

interface DataPoint {
  id: number;
  x: number;
  y: number;
}

const data: DataPoint[] = [
  { id: 0, x: 132, y: 391 },
  { id: 1, x: 330, y: 349 },
  { id: 2, x: 410, y: 192 },
  { id: 3, x: 527, y: 257 },
  { id: 4, x: 688, y: 119 },
  { id: 5, x: 878, y: 55 },
];

const ORIGINAL_WIDTH = 960;
const ORIGINAL_HEIGHT = 500;
const RADIUS = 34;

export function ClickableCircles() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0) return;

    const xScale = scaleLinear().domain([0, ORIGINAL_WIDTH]).range([0, dimensions.width]);

    const yScale = scaleLinear().domain([0, ORIGINAL_HEIGHT]).range([0, dimensions.height]);

    select(svg)
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d: DataPoint) => xScale(d.x))
      .attr('cy', (d: DataPoint) => yScale(d.y))
      .attr('r', RADIUS)
      .attr('fill', (d: DataPoint) => (d.id === selectedCircleId ? 'white' : 'black'))
      .attr('stroke', (d: DataPoint) => (d.id === selectedCircleId ? 'black' : 'none'))
      .attr('stroke-width', (d: DataPoint) => (d.id === selectedCircleId ? 5 : 0))
      .style('cursor', 'pointer')
      .on('click', (_event, d: DataPoint) => {
        setSelectedCircleId(d.id);
      });
  }, [dimensions, selectedCircleId]);

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