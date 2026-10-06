import { useMemo, type ReactNode } from 'react';
import { DataContext } from './DataContext';
import { useExoplanetsDataset } from './useExoplanetsDataset';
import { useColorScale } from './useColorScale';
import { useInteraction } from './InteractionContext';

// Loads and parses the dataset once for the whole explorer. The derived color
// scale lives here too, so every layer that needs the colors reads the
// same scale instance from the context rather than rebuilding it.
export function DataProvider({ children }: { children: ReactNode }) {
  const data = useExoplanetsDataset();
  const { colorColumn } = useInteraction();
  const colorScale = useColorScale(data, colorColumn);

  const value = useMemo(() => ({ data, colorScale }), [data, colorScale]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
