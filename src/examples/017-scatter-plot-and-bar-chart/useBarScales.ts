import { useMemo } from 'react';
import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import { barPadding, type SpeciesDatum } from './config';
import type { Margin } from './margin';

export interface UseBarScalesOptions {
  data: SpeciesDatum[] | null;
  width: number;
  height: number;
  margin: Margin;
  xValue: (datum: SpeciesDatum) => string;
  yValue: (datum: SpeciesDatum) => number;
}

export interface BarScales {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
}

export function useBarScales({
  data,
  width,
  height,
  margin,
  xValue,
  yValue,
}: UseBarScalesOptions): BarScales | null {
  return useMemo(() => {
    // No data yet, so no scales can be constructed.
    if (!data) return null;

    // A band scale places one equally wide slot per species, with padding
    // between the slots. `bandwidth()` later gives the width of each bar.
    const xScale = scaleBand<string>()
      .domain(data.map(xValue))
      .range([margin.left, width - margin.right])
      .padding(barPadding);

    // Bars encode magnitude by length, so the quantitative axis must start at
    // zero. `.nice()` rounds the top of the domain to a pleasant tick value.
    const yScale = scaleLinear()
      .domain([0, max(data, yValue) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale };
  }, [data, width, height, margin, xValue, yValue]);
}
