import { useMemo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import type { ScaleOrdinal } from 'd3-scale';
import { barColorRange, type SpeciesDatum } from './config';

// An ordinal color scale keyed by the color accessor. The domain is derived
// from the data so the colors stay in sync with whatever species the dataset
// contains.
export function useColorScale(
  data: SpeciesDatum[] | null,
  value: (datum: SpeciesDatum) => string,
): ScaleOrdinal<string, string> | null {
  return useMemo(() => {
    if (!data) return null;

    const domain = Array.from(new Set(data.map(value)));

    return scaleOrdinal<string, string>().domain(domain).range(barColorRange);
  }, [data, value]);
}
