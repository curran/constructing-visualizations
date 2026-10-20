import { useMemo } from 'react';
import { rollup } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';
import type { Measure, SpeciesDatum } from './config';

// Aggregate the raw penguin rows into one value per species. This is the
// `rows → group → aggregate` half of the bar chart; the encoding half maps the
// resulting table onto bars. The same rows that feed the scatter plot feed this
// transformation, so the two views stay projections of one dataset.
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
