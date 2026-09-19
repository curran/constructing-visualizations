import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleOrdinal } from 'd3-scale';
import { renderColorLegend } from './renderColorLegend';
import {
  colorLegendDotRadius,
  colorLegendFontSize,
  colorLegendLabel,
  colorLegendLabelOffset,
  colorLegendTickPadding,
  colorLegendTickSpacing,
} from './config';

export interface ColorLegendProps {
  colorScale: ScaleOrdinal<string, string>;
  x: number;
  y: number;
  hoveredSpecies: string | null;
  setHoveredSpecies: (species: string | null) => void;
}

export function ColorLegend({
  colorScale,
  x,
  y,
  hoveredSpecies,
  setHoveredSpecies,
}: ColorLegendProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderColorLegend(select(group), {
      colorScale,
      x,
      y,
      hoveredSpecies,
      setHoveredSpecies,
      label: colorLegendLabel,
      labelOffset: colorLegendLabelOffset,
      tickSpacing: colorLegendTickSpacing,
      tickPadding: colorLegendTickPadding,
      dotRadius: colorLegendDotRadius,
      fontSize: colorLegendFontSize,
    });
  }, [colorScale, x, y, hoveredSpecies, setHoveredSpecies]);

  return <g ref={groupRef} className="color-legend" />;
}
