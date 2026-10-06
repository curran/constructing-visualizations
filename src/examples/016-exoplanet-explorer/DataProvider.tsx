import { useMemo, type ReactNode } from 'react';
import { DataContext } from './DataContext';
import { useExoplanetsDataset } from './useExoplanetsDataset';
import { useColorScale } from './useColorScale';
import { useInteraction } from './InteractionContext';

// Loads the dataset and derives the currently selected color scale for every
// layer from a single shared context value.
export function DataProvider({ children }: { children: ReactNode }) {
  const data = useExoplanetsDataset();
  const { colorColumn } = useInteraction();
  const colorScale = useColorScale(data, colorColumn);

  const value = useMemo(() => ({ data, colorScale }), [data, colorScale]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
