import { useMemo } from 'react';
import { max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type { ScaleLinear } from 'd3-scale';
import { binEnd, binFrequency, binStart, type HistogramBin } from './config';
import type { Margin } from './margin';

export interface UseScalesOptions {
  bins: HistogramBin[] | null;
  width: number;
  height: number;
  margin: Margin;
}

export interface Scales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function useScales({ bins, width, height, margin }: UseScalesOptions): Scales | null {
  return useMemo(() => {
    // No bins yet, so there is nothing to scale.
    if (!bins || bins.length === 0) return null;

    // The x domain runs from the lower edge of the first bin to the upper edge
    // of the last. d3.bin picks nice boundaries, so the axis lands on round
    // numbers without further rounding.
    const xScale = scaleLinear()
      .domain([binStart(bins[0]), binEnd(bins[bins.length - 1])])
      .range([margin.left, width - margin.right]);

    // Counts start at zero and use a little headroom above the tallest bar.
    const yScale = scaleLinear()
      .domain([0, max(bins, binFrequency) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale };
  }, [bins, width, height, margin]);
}
