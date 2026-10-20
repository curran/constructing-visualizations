import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import { renderBarChartAxes } from './renderBarChartAxes';
import { margin } from './config';

export interface BarChartAxesProps {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  height: number;
  yTickFormat: (value: number) => string;
}

export function BarChartAxes({ xScale, yScale, height, yTickFormat }: BarChartAxesProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBarChartAxes(select(group), { xScale, yScale, yTickFormat });
  }, [xScale, yScale, yTickFormat]);

  return (
    <g ref={groupRef} className="axes">
      <g className="x-axis" transform={`translate(0, ${height - margin.bottom})`} />
      <g className="y-axis" transform={`translate(${margin.left}, 0)`} />
    </g>
  );
}
