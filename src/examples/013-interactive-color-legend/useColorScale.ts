import { useMemo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import type { ScaleOrdinal } from 'd3-scale';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { colorRange, colorValue } from './config';

export function useColorScale(data: PenguinRow[] | null): ScaleOrdinal<string, string> | null {
  return useMemo(() => {
    if (!data) return null;

    // The domain is the distinct species present in the data, in first-seen
    // order. Deriving it from the data (rather than hardcoding it) keeps the
    // legend in sync with whatever the dataset actually contains.
    const domain = Array.from(new Set(data.map(colorValue)));

    return scaleOrdinal<string, string>().domain(domain).range(colorRange);
  }, [data]);
}
