import { Delaunay } from 'd3-delaunay';
import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import type { CircleDataPoint } from './renderCircles';

export interface RenderVoronoiOverlayOptions {
  data: CircleDataPoint[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  width: number;
  height: number;
  setHoveredCircleId: (id: number | null) => void;
  showVoronoi: boolean;
}

// An invisible Voronoi tessellation drawn on top of the circles. Each cell
// contains exactly one data point, so a cell acts as an oversized (and
// therefore easy to hit) target for the small circle at its center. The cell
// borders are hidden unless showVoronoi is set (the "V" easter egg).
export function renderVoronoiOverlay(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderVoronoiOverlayOptions,
) {
  const { data, xScale, yScale, width, height, setHoveredCircleId, showVoronoi } = options;

  const delaunay = Delaunay.from(
    data,
    (d) => xScale(d.x),
    (d) => yScale(d.y),
  );
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  group
    .selectAll<SVGPathElement, CircleDataPoint>('path')
    .data(data)
    .join('path')
    .attr('d', (_d, i) => voronoi.renderCell(i))
    .attr('fill', 'none')
    .attr('stroke', showVoronoi ? 'black' : 'none')
    .attr('stroke-width', 1)
    .attr('pointer-events', 'all')
    .on('mouseover', (_event, d) => {
      setHoveredCircleId(d.id);
    })
    .on('mouseout', () => {
      setHoveredCircleId(null);
    });
}
