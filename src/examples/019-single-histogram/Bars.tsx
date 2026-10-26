import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderBars } from './renderBars';
import type { HistogramBin } from './config';

export interface BarsProps {
  bins: HistogramBin[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  hoveredBin: HistogramBin | null;
  onHoverBin: (bin: HistogramBin | null) => void;
}

// React owns this container group; D3 fills it with one rect per bin. The
// component re-runs the join whenever the bins, scales, or hover change.
export function Bars({ bins, xScale, yScale, hoveredBin, onHoverBin }: BarsProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBars(select(group), { bins, xScale, yScale, hoveredBin, onHoverBin });
  }, [bins, xScale, yScale, hoveredBin, onHoverBin]);

  return <g ref={groupRef} className="bars" />;
}
