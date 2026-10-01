import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderMarks } from './renderMarks';
import type { PenguinRow } from './usePenguinsDataset';

export interface MarksProps {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
}

export function Marks({ data, xScale, yScale, xValue, yValue }: MarksProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderMarks(select(group), { data, xScale, yScale, xValue, yValue });
  }, [data, xScale, yScale, xValue, yValue]);

  return <g ref={groupRef} className="marks" />;
}
