import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderVoronoiOverlay } from './renderVoronoiOverlay';
import { useInteraction } from './InteractionContext';
import { margin } from './config';
import type { PenguinRow } from './usePenguinsDataset';

export interface VoronoiOverlayProps {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  width: number;
  height: number;
}

// The overlay reads the active encodings, the tooltip setter, and the Voronoi
// visibility from context, so it only needs the rows and geometry as props.
export function VoronoiOverlay({ data, xScale, yScale, width, height }: VoronoiOverlayProps) {
  const { xColumn, yColumn, setTooltip, showVoronoi } = useInteraction();
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderVoronoiOverlay(select(group), {
      data,
      xScale,
      yScale,
      xValue: xColumn.accessor,
      yValue: yColumn.accessor,
      width,
      height,
      margin,
      setTooltip,
      showVoronoi,
    });
  }, [data, xScale, yScale, xColumn, yColumn, width, height, setTooltip, showVoronoi]);

  return <g ref={groupRef} className="voronoi-overlay" />;
}
