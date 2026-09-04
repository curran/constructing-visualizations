import { useMemo } from 'react';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type { ScaleLinear } from 'd3-scale';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';

export interface Accessor {
  (row: PenguinRow): number;
}

export interface UseScalesOptions {
  data: PenguinRow[] | null;
  width: number;
  height: number;
  xValue: Accessor;
  yValue: Accessor;
}

export interface Scales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function useScales({
  data,
  width,
  height,
  xValue,
  yValue,
}: UseScalesOptions): Scales | null {
  return useMemo(() => {
    // No data yet, so no scales can be constructed.
    if (!data) return null;

    return {
      // The domain maps data space, and the range maps to screen space.
      xScale: scaleLinear()
        // `extent` returns the min and max of the data for the domain.
        .domain(extent(data, xValue) as [number, number])
        .range([0, width]),
      yScale: scaleLinear()
        .domain(extent(data, yValue) as [number, number])
        // Flip the y range so that larger values appear higher on the screen.
        .range([height, 0]),
    };
  }, [data, width, height, xValue, yValue]);
}
