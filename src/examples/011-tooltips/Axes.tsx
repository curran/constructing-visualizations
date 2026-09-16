import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderAxes } from './renderAxes';
import type { Margin } from './margin';

export interface AxesProps {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  height: number;
  margin: Margin;
}

export function Axes({ xScale, yScale, height, margin }: AxesProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderAxes(select(group), { xScale, yScale });
  }, [xScale, yScale]);

  return (
    <g ref={groupRef} className="axes">
      <g className="x-axis" transform={`translate(0, ${height - margin.bottom})`} />
      <g className="y-axis" transform={`translate(${margin.left}, 0)`} />
    </g>
  );
}
