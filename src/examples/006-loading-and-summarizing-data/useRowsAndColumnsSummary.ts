import { useMemo } from 'react';
import type { PenguinRow } from './usePenguinsDataset';

export interface Summary {
  rows: number;
  columns: number;
}

export function useRowsAndColumnsSummary(data: PenguinRow[] | null): Summary | null {
  return useMemo(() => {
    if (!data) return null;
    console.log(JSON.stringify(data, null, 2));
    return {
      rows: data.length,
      columns: Object.keys(data[0]).length,
    };
  }, [data]);
}
