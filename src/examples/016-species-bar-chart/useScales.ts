import { useMemo } from 'react';
import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { SpeciesDatum } from './useAggregatedData';
import type { Margin } from './margin';
import { barPadding } from './config';

export interface UseScalesOptions {
  data: SpeciesDatum[] | null;
  width: number;
  height: number;
  margin: Margin;
}

export interface Scales {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
}

export function useScales({ data, width, height, margin }: UseScalesOptions): Scales | null {
  return useMemo(() => {
    // No data yet, so no scales can be constructed.
    if (!data) return null;

    // A band scale places one equally wide slot per species, with padding
    // between the slots. `bandwidth()` later gives the width of each bar.
    const xScale = scaleBand<string>()
      .domain(data.map((datum) => datum.species))
      .range([margin.left, width - margin.right])
      .padding(barPadding);

    // Bars encode magnitude by length, so the quantitative axis must start at
    // zero. `.nice()` rounds the top of the domain to a pleasant tick value.
    const yScale = scaleLinear()
      .domain([0, max(data, (datum) => datum.value) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale };
  }, [data, width, height, margin]);
}
