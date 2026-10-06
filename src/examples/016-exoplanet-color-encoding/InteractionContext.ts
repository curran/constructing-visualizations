import { createContext, useContext } from 'react';
import type { ColorColumn, NumericColumn } from './config';
import type { TooltipState } from './renderVoronoiOverlay';

// The interaction context owns every piece of interaction state: which columns
// are encoded on the axes, which category is hovered in the legend, the active
// tooltip, and the Voronoi visibility toggle. Derived values (the selected
// columns and the hovered row index) are exposed alongside the raw state so
// consumers do not repeat the derivation.
export interface InteractionContextValue {
  xKey: string;
  setXKey: (key: string) => void;
  yKey: string;
  setYKey: (key: string) => void;
  colorKey: string;
  setColorKey: (key: string) => void;
  xColumn: NumericColumn;
  yColumn: NumericColumn;
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
