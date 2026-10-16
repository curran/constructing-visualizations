import { useMemo } from 'react';
import { rollup } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';
import type { Measure } from './config';

// One bar: a species and the aggregated value for the selected measure.
export interface SpeciesDatum {
  species: string;
  value: number;
}

// Aggregate the raw penguin rows into one value per species. This is the
// `rows → group → aggregate` half of the visualization; the encoding half
// maps the resulting table onto bars.
export function useAggregatedData(
  data: PenguinRow[] | null,
  measure: Measure,
): SpeciesDatum[] | null {
  return useMemo(() => {
    if (!data) return null;

    // `rollup` groups the rows by species and reduces each group to a single
    // value. The iteration order is first-seen, which keeps the bars stable.
    const grouped = rollup(
      data,
      (rows) => measure.aggregate(rows),
      (row) => row.species,
    );

    return Array.from(grouped, ([species, value]) => ({ species, value }));
  }, [data, measure]);
}
