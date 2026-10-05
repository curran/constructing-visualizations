import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderMarks } from './renderMarks';
import { useData } from './DataContext';
import { useInteraction } from './InteractionContext';
import { colorValue } from './config';
import type { PenguinRow } from './usePenguinsDataset';

export interface MarksProps {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

// The marks read their color scale and all interaction state from context, so
// the only props they need are the rows and the scales that position them.
export function Marks({ data, xScale, yScale }: MarksProps) {
  const { colorScale } = useData();
  const { xColumn, yColumn, hoveredSpecies, hoveredIndex } = useInteraction();
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !colorScale) return;

    renderMarks(select(group), {
      data,
      xScale,
      yScale,
      colorScale,
      xValue: xColumn.accessor,
      yValue: yColumn.accessor,
      colorValue,
      hoveredSpecies,
      hoveredIndex,
    });
  }, [data, xScale, yScale, colorScale, xColumn, yColumn, hoveredSpecies, hoveredIndex]);

  return <g ref={groupRef} className="marks" />;
}
