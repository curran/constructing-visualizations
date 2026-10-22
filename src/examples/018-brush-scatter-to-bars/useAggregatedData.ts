import { useMemo } from 'react';
import { rollup } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';
import type { Measure, SpeciesDatum } from './config';

// Aggregate rows into one value per species. This is the `rows → group →
// aggregate` half of the bar chart; the encoding half maps the resulting table
// onto bars.
//
// The bar chart calls this twice: once with every row, to draw the faded
// background, and once with the brushed rows, to draw the solid foreground. A
// species that a subset happens to exclude is simply absent from the result;
// the shared band scale still reserves its slot, so the other bars never move.
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
