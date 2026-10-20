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
  onHoverSpecies: (species: string | null) => void;
}

// React owns this container group; D3 fills it with the circles. The component
// re-runs the render whenever the rows, scales, or hover state change.
export function Marks({
  data,
  xScale,
  yScale,
  colorScale,
  xValue,
  yValue,
  hoveredSpecies,
  onHoverSpecies,
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
      onHoverSpecies,
    });
  }, [data, xScale, yScale, colorScale, xValue, yValue, hoveredSpecies, onHoverSpecies]);

  return <g ref={groupRef} className="marks" />;
}
