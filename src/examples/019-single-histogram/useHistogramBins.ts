import { useMemo } from 'react';
import { bin } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';
import type { HistogramBin, NumericAttribute } from './config';

// The transformation at the center of this example: continuous measurements
// become a manufactured set of intervals, and each interval becomes a count.
// `d3.bin` chooses nice thresholds and returns every interval, including empty
// ones, so the bars stay evenly spaced across the full domain.
export function useHistogramBins(
  data: PenguinRow[] | null,
  attribute: NumericAttribute,
  binCount: number,
): HistogramBin[] | null {
  return useMemo(() => {
    if (!data) return null;

    return (
      bin<PenguinRow, number>()
        .value(attribute.accessor)
        // A threshold count asks d3 to pick approximately that many nice
        // boundaries. The actual number of bins can differ from the request,
        // which is why the readout reports what was actually produced.
        .thresholds(binCount)(data)
    );
  }, [data, attribute, binCount]);
}
