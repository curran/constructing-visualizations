import { useMemo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import type { ScaleOrdinal } from 'd3-scale';
import type { PenguinRow } from './usePenguinsDataset';
import { colorRange, colorValue } from './config';

// The species color scale is built once and shared by both views. Sharing the
// scale (rather than building one per view) is what makes a species the same
// color in the scatter plot and in the bar chart.
export function useColorScale(data: PenguinRow[] | null): ScaleOrdinal<string, string> | null {
  return useMemo(() => {
    if (!data) return null;

    const domain = Array.from(new Set(data.map(colorValue)));

    return scaleOrdinal<string, string>().domain(domain).range(colorRange);
  }, [data]);
}
