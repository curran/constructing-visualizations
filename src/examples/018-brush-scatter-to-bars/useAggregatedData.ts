import { useMemo } from 'react';
import { rollup } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';
import type { Measure, SpeciesDatum } from './config';

// Aggregate rows into one value per species. This is the `rows → group →
// aggregate` half of the bar chart; the encoding half maps the resulting table
// onto bars.
//
// The bar chart calls this twice: once with every row, to draw the faded
// background, and once with the brushed rows, to draw the solid foreground.
//
// `species` fixes the bar order and guarantees a datum for every species: a
// selection that excludes a species entirely still produces a zero bar rather
// than a gap, so the bars never change places as the brush moves.
export function useAggregatedData(
  data: PenguinRow[] | null,
  measure: Measure,
  species: string[] | null,
): SpeciesDatum[] | null {
  return useMemo(() => {
    if (!data || !species) return null;

    // `rollup` groups the rows by species and reduces each group to a single
    // value.
    const grouped = rollup(
      data,
      (rows) => measure.aggregate(rows),
      (row) => row.species,
    );

    return species.map((name) => ({ species: name, value: grouped.get(name) ?? 0 }));
  }, [data, measure, species]);
}
