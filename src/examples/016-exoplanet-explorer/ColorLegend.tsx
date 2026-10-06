import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { renderColorLegend } from './renderColorLegend';
import { useData } from './DataContext';
import { useInteraction } from './InteractionContext';
import { interpolateBlues } from 'd3-scale-chromatic';
import {
  colorLegendDotRadius,
  colorLegendFontSize,
  colorLegendHeight,
  colorLegendLabelWidth,
  colorLegendTickPadding,
  colorLegendTickSpacing,
} from './config';
import type { ColorScale } from './useColorScale';

const categoricalColumns = 3;

function formatValue(value: number) {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 }).format(value);
}

export function ColorLegend() {
  const { colorScale } = useData();
  const { colorColumn, hoveredCategory, setHoveredCategory } = useInteraction();
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || colorScale?.type !== 'categorical') return;

    renderColorLegend(select(group), {
      colorScale: colorScale.scale,
      hoveredCategory,
      setHoveredCategory,
      tickSpacing: colorLegendTickSpacing,
      tickPadding: colorLegendTickPadding,
      dotRadius: colorLegendDotRadius,
      fontSize: colorLegendFontSize,
      columns: categoricalColumns,
    });
  }, [colorScale, hoveredCategory, setHoveredCategory]);

  if (!colorScale) return null;

  if (colorScale.type === 'quantitative') {
    return <QuantitativeColorLegend colorColumnLabel={colorColumn.label} colorScale={colorScale} />;
  }

  const rows = Math.ceil(colorScale.domain.length / categoricalColumns);
  const width = colorLegendLabelWidth + categoricalColumns * colorLegendTickSpacing;
  const height = Math.max(colorLegendHeight, rows * 22 + 12);

  return (
    <svg
      className="overflow-visible"
      width={width}
      height={height}
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
        transform={`translate(${colorLegendLabelWidth}, 12)`}
      />
    </svg>
  );
}

function QuantitativeColorLegend({
  colorColumnLabel,
  colorScale,
}: {
  colorColumnLabel: string;
  colorScale: Extract<ColorScale, { type: 'quantitative' }>;
}) {
  const [min, max] = colorScale.domain;
  const midpoint = min + (max - min) / 2;
  const width = 220;
  const barWidth = 112;
  const barX = 0;
  const labelY = 32;

  return (
    <svg
      className="overflow-visible"
      width={width}
      height={colorLegendHeight}
      role="img"
      aria-label={`Continuous color legend for ${colorColumnLabel}, from ${formatValue(min)} to ${formatValue(max)}`}
    >
      <text x={0} y={10} fontSize={colorLegendFontSize} className="fill-gray-700">
        {colorColumnLabel}
      </text>
      <defs>
        <linearGradient id="exoplanet-blues-gradient">
          {Array.from({ length: 11 }, (_, index) => {
            const t = index / 10;
            return <stop key={t} offset={`${t * 100}%`} stopColor={interpolateBlues(t)} />;
          })}
        </linearGradient>
      </defs>
      <rect x={barX} y={15} width={barWidth} height={8} fill="url(#exoplanet-blues-gradient)" />
      <text x={barX} y={labelY} fontSize={10} className="fill-gray-700">
        {formatValue(min)}
      </text>
      <text
        x={barX + barWidth / 2}
        y={labelY}
        textAnchor="middle"
        fontSize={10}
        className="fill-gray-700"
      >
        {formatValue(midpoint)}
      </text>
      <text x={barX + barWidth} y={labelY} textAnchor="end" fontSize={10} className="fill-gray-700">
        {formatValue(max)}
      </text>
    </svg>
  );
}
