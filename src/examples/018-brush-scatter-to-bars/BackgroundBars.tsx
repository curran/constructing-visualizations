import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleBand, ScaleLinear, ScaleOrdinal } from 'd3-scale';
import { renderBars } from './renderBars';
import { fadedOpacity, type SpeciesDatum } from './config';

export interface BackgroundBarsProps {
  data: SpeciesDatum[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
  xValue: (datum: SpeciesDatum) => string;
  yValue: (datum: SpeciesDatum) => number;
  colorValue: (datum: SpeciesDatum) => string;
}

// The context layer: the whole dataset, aggregated once and drawn at the same
// faded opacity the scatter plot uses for unselected marks. It gives each
// selection bar something to be compared against, and because it never depends
// on the brush, it holds still while the selection moves.
//
// It is inert (`pointer-events: none`) so hover and the brush only ever talk to
// the solid bars in front of it.
export function BackgroundBars({
  data,
  xScale,
  yScale,
  colorScale,
  xValue,
  yValue,
  colorValue,
}: BackgroundBarsProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBars(select(group), {
      data,
      xScale,
      yScale,
      colorScale,
      xValue,
      yValue,
      colorValue,
      baseOpacity: fadedOpacity,
    });
  }, [data, xScale, yScale, colorScale, xValue, yValue, colorValue]);

  return <g ref={groupRef} className="bars-background" pointerEvents="none" />;
}
