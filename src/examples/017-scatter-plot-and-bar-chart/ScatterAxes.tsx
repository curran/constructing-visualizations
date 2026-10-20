import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderScatterAxes } from './renderScatterAxes';
import { margin } from './config';

export interface ScatterAxesProps {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  height: number;
}

export function ScatterAxes({ xScale, yScale, height }: ScatterAxesProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderScatterAxes(select(group), { xScale, yScale });
  }, [xScale, yScale]);

  return (
    <g ref={groupRef} className="axes">
      <g className="x-axis" transform={`translate(0, ${height - margin.bottom})`} />
      <g className="y-axis" transform={`translate(${margin.left}, 0)`} />
    </g>
  );
}
