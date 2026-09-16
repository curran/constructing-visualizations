import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderCircles } from './renderCircles';
import type { CircleDataPoint } from './renderCircles';

export interface CirclesProps {
  data: CircleDataPoint[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  hoveredCircleId: number | null;
}

export function Circles({ data, xScale, yScale, hoveredCircleId }: CirclesProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderCircles(select(group), {
      data,
      xScale,
      yScale,
      hoveredCircleId,
    });
  }, [data, xScale, yScale, hoveredCircleId]);

  return <g ref={groupRef} className="circles" />;
}
