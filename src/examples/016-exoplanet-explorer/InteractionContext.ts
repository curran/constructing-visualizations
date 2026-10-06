import { createContext, useContext } from 'react';
import type { ColorColumn, NumericColumn } from './config';
import type { TooltipState } from './renderVoronoiOverlay';

// The interaction context owns encoding selections, category highlighting,
// tooltip state, and the Voronoi visibility toggle.
export interface InteractionContextValue {
  xKey: string;
  setXKey: (key: string) => void;
  yKey: string;
  setYKey: (key: string) => void;
  xColumn: NumericColumn;
  yColumn: NumericColumn;
  colorKey: string;
  setColorKey: (key: string) => void;
  colorColumn: ColorColumn;
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
  tooltip: TooltipState | null;
  setTooltip: (tooltip: TooltipState | null) => void;
  hoveredIndex: number | null;
  showVoronoi: boolean;
}

export const InteractionContext = createContext<InteractionContextValue | null>(null);

export function useInteraction(): InteractionContextValue {
  const value = useContext(InteractionContext);
  if (!value) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return value;
}
