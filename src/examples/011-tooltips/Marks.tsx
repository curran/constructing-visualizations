import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderMarks } from './renderMarks';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';

export interface MarksProps {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
  hoveredIndex: number | null;
}

export function Marks({ data, xScale, yScale, xValue, yValue, hoveredIndex }: MarksProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderMarks(select(group), {
      data,
      xScale,
      yScale,
      xValue,
      yValue,
      hoveredIndex,
    });
  }, [data, xScale, yScale, xValue, yValue, hoveredIndex]);

  return <g ref={groupRef} className="marks" />;
}
