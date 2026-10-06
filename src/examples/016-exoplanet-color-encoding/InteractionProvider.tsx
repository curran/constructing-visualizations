import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { InteractionContext, type InteractionContextValue } from './InteractionContext';
import { defaultXKey, defaultYKey, getColumn } from './config';
import type { TooltipState } from './renderVoronoiOverlay';

export function InteractionProvider({ children }: { children: ReactNode }) {
  // The two menus drive which columns are mapped to the x and y axes.
  const [xKey, setXKey] = useState(defaultXKey);
  const [yKey, setYKey] = useState(defaultYKey);

  // Hover state: a species highlighted in the legend, and the mark under the
  // cursor (which also carries the tooltip's anchor point).
  const [hoveredSpecies, setHoveredSpecies] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const [showVoronoi, setShowVoronoi] = useState(false);

  // Easter egg: pressing "V" toggles the Voronoi cell borders on and off.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'v') {
        setShowVoronoi((shown) => !shown);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = useMemo<InteractionContextValue>(
    () => ({
      xKey,
      setXKey,
      yKey,
      setYKey,
      xColumn: getColumn(xKey),
      yColumn: getColumn(yKey),
      hoveredSpecies,
      setHoveredSpecies,
      tooltip,
      setTooltip,
      hoveredIndex: tooltip?.index ?? null,
      showVoronoi,
    }),
    [xKey, yKey, hoveredSpecies, tooltip, showVoronoi],
  );

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}
