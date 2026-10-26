import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderBarHighlight, renderBars } from './renderBars';
import type { HistogramBin } from './config';

export interface BarsProps {
  bins: HistogramBin[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  hoveredBin: HistogramBin | null;
  onHoverBin: (bin: HistogramBin | null) => void;
}

// React owns this container group; D3 fills it with one rect per bin. The join
// re-runs when the bins or scales change; hover is applied separately so it
// cannot disturb an exit animation in progress.
export function Bars({ bins, xScale, yScale, hoveredBin, onHoverBin }: BarsProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBars(select(group), { bins, xScale, yScale, onHoverBin });
  }, [bins, xScale, yScale, onHoverBin]);

  // Highlighting is separate from the join so that hovering a bar does not
  // re-run the join and cut short the exit animation of an older generation.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBarHighlight(select(group), hoveredBin);
  }, [bins, hoveredBin]);

  return <g ref={groupRef} className="bars" />;
}
