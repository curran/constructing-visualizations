import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleBand, ScaleLinear, ScaleOrdinal } from 'd3-scale';
import { renderBars } from './renderBars';
import type { SpeciesDatum } from './config';

export interface BarsProps {
  data: SpeciesDatum[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
  xValue: (datum: SpeciesDatum) => string;
  yValue: (datum: SpeciesDatum) => number;
  colorValue: (datum: SpeciesDatum) => string;
}

// React owns this container group; D3 fills it with the bars. The component
// re-runs the render whenever the aggregated data, scales, or accessors change.
export function Bars({ data, xScale, yScale, colorScale, xValue, yValue, colorValue }: BarsProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBars(select(group), { data, xScale, yScale, colorScale, xValue, yValue, colorValue });
  }, [data, xScale, yScale, colorScale, xValue, yValue, colorValue]);

  return <g ref={groupRef} className="bars" />;
}
