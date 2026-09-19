import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear, ScaleOrdinal } from 'd3-scale';
import { renderMarks } from './renderMarks';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';

export interface MarksProps {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
  colorValue: (row: PenguinRow) => string;
  hoveredSpecies: string | null;
}

export function Marks({
  data,
  xScale,
  yScale,
  colorScale,
  xValue,
  yValue,
  colorValue,
  hoveredSpecies,
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
    });
  }, [data, xScale, yScale, colorScale, xValue, yValue, colorValue, hoveredSpecies]);

  return <g ref={groupRef} className="marks" />;
}
