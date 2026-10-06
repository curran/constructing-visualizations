import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { renderColorLegend } from './renderColorLegend';
import { useData } from './DataContext';
import { useInteraction } from './InteractionContext';
import {
  colorLegendDotRadius,
  colorLegendFontSize,
  colorLegendHeight,
  colorLegendLabel,
  colorLegendLabelWidth,
  colorLegendTickPadding,
  colorLegendTickSpacing,
} from './config';

// The legend is its own small SVG so it can live in the header next to the
// encoding menus, outside the main chart SVG. It reads the color scale and the
// hover state from context and owns a local ref for the D3-rendered ticks.
export function ColorLegend() {
  const { colorScale } = useData();
  const { hoveredSpecies, setHoveredSpecies } = useInteraction();
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !colorScale) return;

    renderColorLegend(select(group), {
      colorScale,
      hoveredSpecies,
      setHoveredSpecies,
      tickSpacing: colorLegendTickSpacing,
      tickPadding: colorLegendTickPadding,
      dotRadius: colorLegendDotRadius,
      fontSize: colorLegendFontSize,
    });
  }, [colorScale, hoveredSpecies, setHoveredSpecies]);

  if (!colorScale) return null;

  const width = colorLegendLabelWidth + colorScale.domain().length * colorLegendTickSpacing;

  return (
    <svg
      className="overflow-visible"
      width={width}
      height={colorLegendHeight}
      role="img"
      aria-label="Color legend showing the penguin species"
    >
      <text
        x={0}
        y={colorLegendHeight / 2}
        dy="0.32em"
        fontSize={colorLegendFontSize}
        className="fill-gray-700"
      >
        {colorLegendLabel}
      </text>
      <g
        ref={groupRef}
        className="color-legend"
        transform={`translate(${colorLegendLabelWidth}, ${colorLegendHeight / 2})`}
      />
    </svg>
  );
}
