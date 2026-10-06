import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleOrdinal, ScaleSequential } from 'd3-scale';
import { renderColorLegend } from './renderColorLegend';
import { useData } from './DataContext';
import { useInteraction } from './InteractionContext';
import {
  colorLegendDotRadius,
  colorLegendFontSize,
  colorLegendHeight,
  colorLegendLabelWidth,
  colorLegendTickPadding,
  colorLegendTickSpacing,
} from './config';

export function ColorLegend() {
  const { colorScale } = useData();
  const { colorColumn, hoveredCategory, setHoveredCategory } = useInteraction();
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !colorScale || colorColumn.type !== 'categorical') return;

    renderColorLegend(select(group), {
      colorScale: colorScale as ScaleOrdinal<string, string>,
      hoveredCategory,
      setHoveredCategory,
      tickSpacing: colorLegendTickSpacing,
      tickPadding: colorLegendTickPadding,
      dotRadius: colorLegendDotRadius,
      fontSize: colorLegendFontSize,
    });
  }, [colorScale, colorColumn, hoveredCategory, setHoveredCategory]);

  if (!colorScale) return null;

  if (colorColumn.type === 'quantitative') {
    const scale = colorScale as ScaleSequential<string>;
    const [minimum, maximum] = scale.domain();
    const format = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });

    return (
      <svg
        width={280}
        height={colorLegendHeight}
        role="img"
        aria-label={`Continuous color legend for ${colorColumn.label}`}
      >
        <defs>
          <linearGradient id="exoplanet-color-gradient">
            {Array.from({ length: 11 }, (_unused, index) => {
              const t = index / 10;
              return (
                <stop
                  key={t}
                  offset={`${t * 100}%`}
                  stopColor={scale(minimum + (maximum - minimum) * t)}
                />
              );
            })}
          </linearGradient>
        </defs>
        <text x={0} y={12} fontSize={colorLegendFontSize} className="fill-gray-700">
          {colorColumn.label}
        </text>
        <rect x={0} y={18} width={220} height={10} fill="url(#exoplanet-color-gradient)" />
        <text x={0} y={colorLegendHeight - 1} fontSize={11} className="fill-gray-600">
          {format.format(minimum)}
        </text>
        <text
          x={220}
          y={colorLegendHeight - 1}
          textAnchor="end"
          fontSize={11}
          className="fill-gray-600"
        >
          {format.format(maximum)}
        </text>
      </svg>
    );
  }

  const scale = colorScale as ScaleOrdinal<string, string>;
  const width = colorLegendLabelWidth + scale.domain().length * colorLegendTickSpacing;

  return (
    <svg
      className="overflow-visible"
      width={width}
      height={colorLegendHeight}
      role="img"
      aria-label={`Color legend showing ${colorColumn.label}`}
    >
      <text
        x={0}
        y={colorLegendHeight / 2}
        dy="0.32em"
        fontSize={colorLegendFontSize}
        className="fill-gray-700"
      >
        {colorColumn.label}
      </text>
      <g
        ref={groupRef}
        className="color-legend"
        transform={`translate(${colorLegendLabelWidth}, ${colorLegendHeight / 2})`}
      />
    </svg>
  );
}
