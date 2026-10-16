import { useMemo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import type { ScaleOrdinal } from 'd3-scale';
import type { SpeciesDatum } from './useAggregatedData';
import { barColorRange } from './config';

// An ordinal color scale keyed by species. The domain is derived from the data
// so the colors stay in sync with whatever species the dataset contains.
export function useColorScale(data: SpeciesDatum[] | null): ScaleOrdinal<string, string> | null {
  return useMemo(() => {
    if (!data) return null;

    const domain = data.map((datum) => datum.species);

    return scaleOrdinal<string, string>().domain(domain).range(barColorRange);
  }, [data]);
}
