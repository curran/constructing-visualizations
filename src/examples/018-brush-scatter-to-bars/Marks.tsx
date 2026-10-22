import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear, ScaleOrdinal } from 'd3-scale';
import { renderMarks } from './renderMarks';
import { colorValue } from './config';
import type { PenguinRow } from './usePenguinsDataset';

export interface MarksProps {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
  hoveredSpecies: string | null;
  isSelected: (row: PenguinRow) => boolean;
}

// React owns this container group; D3 fills it with the circles. The component
// re-runs the render whenever the rows, scales, hover state, or brush selection
// change.
export function Marks({
  data,
  xScale,
  yScale,
  colorScale,
  xValue,
  yValue,
  hoveredSpecies,
  isSelected,
}: MarksProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderMarks(select(group), {
      data,
      xScale,
      yScale,
      colorScale,
      xValue,
      yValue,
      colorValue,
      hoveredSpecies,
      isSelected,
    });
  }, [data, xScale, yScale, colorScale, xValue, yValue, hoveredSpecies, isSelected]);

  return <g ref={groupRef} className="marks" />;
}
