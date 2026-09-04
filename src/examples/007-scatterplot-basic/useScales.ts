import { useMemo } from 'react';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type { ScaleLinear } from 'd3-scale';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';

export interface UseScalesOptions {
  data: PenguinRow[] | null;
  width: number;
  height: number;
}

export interface Scales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
}

export function useScales({ data, width, height }: UseScalesOptions): Scales {
  return useMemo(() => {
    const xValue = (row: PenguinRow) => row.bill_length_mm;
    const yValue = (row: PenguinRow) => row.bill_depth_mm;

    const xExtent = extent(data ?? [], xValue);
    const yExtent = extent(data ?? [], yValue);

    // d3.extent skips missing values; an empty result means no usable data yet.
    const xDomain: [number, number] =
      xExtent[0] !== undefined && xExtent[1] !== undefined ? xExtent : [0, 1];
    const yDomain: [number, number] =
      yExtent[0] !== undefined && yExtent[1] !== undefined ? yExtent : [0, 1];

    const xScale = scaleLinear().domain(xDomain).range([0, width]);

    // Flip the y range so that larger values appear higher on the screen.
    const yScale = scaleLinear().domain(yDomain).range([height, 0]);

    return { xScale, yScale, xValue, yValue };
  }, [data, width, height]);
}