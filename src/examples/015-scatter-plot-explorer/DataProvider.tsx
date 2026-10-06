import { useMemo, type ReactNode } from 'react';
import { DataContext } from './DataContext';
import { usePenguinsDataset } from './usePenguinsDataset';
import { useColorScale } from './useColorScale';

// Loads and parses the dataset once for the whole explorer. The derived color
// scale lives here too, so every layer that needs the species colors reads the
// same scale instance from the context rather than rebuilding it.
export function DataProvider({ children }: { children: ReactNode }) {
  const data = usePenguinsDataset();
  const colorScale = useColorScale(data);

  const value = useMemo(() => ({ data, colorScale }), [data, colorScale]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
