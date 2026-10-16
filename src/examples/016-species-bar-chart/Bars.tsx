import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleBand, ScaleLinear, ScaleOrdinal } from 'd3-scale';
import { renderBars } from './renderBars';
import type { SpeciesDatum } from './useAggregatedData';

export interface BarsProps {
  data: SpeciesDatum[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
}

// React owns this container group; D3 fills it with the bars. The component
// re-runs the render whenever the aggregated data or scales change.
export function Bars({ data, xScale, yScale, colorScale }: BarsProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBars(select(group), { data, xScale, yScale, colorScale });
  }, [data, xScale, yScale, colorScale]);

  return <g ref={groupRef} className="bars" />;
}
