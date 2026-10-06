import { createContext, useContext } from 'react';
import type { ExoplanetRow } from './useExoplanetsDataset';
import type { ColorScale } from './useColorScale';

// The data context exposes the loaded, parsed dataset together with the color
// scale derived from it. Components read these values directly instead of
// receiving them through props from the top of the tree.
export interface DataContextValue {
  data: ExoplanetRow[] | null;
  colorScale: ColorScale | null;
}

export const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) {
    throw new Error('useData must be used within a DataProvider');
  }
  return value;
}
