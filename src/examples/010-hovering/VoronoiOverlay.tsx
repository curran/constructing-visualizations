import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderVoronoiOverlay } from './renderVoronoiOverlay';
import type { CircleDataPoint } from './renderCircles';

export interface VoronoiOverlayProps {
  data: CircleDataPoint[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  width: number;
  height: number;
  setHoveredCircleId: (id: number | null) => void;
  showVoronoi: boolean;
}

export function VoronoiOverlay({
  data,
  xScale,
  yScale,
  width,
  height,
  setHoveredCircleId,
  showVoronoi,
}: VoronoiOverlayProps) {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderVoronoiOverlay(select(group), {
      data,
      xScale,
      yScale,
      width,
      height,
      setHoveredCircleId,
      showVoronoi,
    });
  }, [data, xScale, yScale, width, height, setHoveredCircleId, showVoronoi]);

  return <g ref={groupRef} className="voronoi-overlay" />;
}
