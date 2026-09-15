import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';

export interface CircleDataPoint {
  id: number;
  x: number;
  y: number;
}

export interface RenderCirclesOptions {
  data: CircleDataPoint[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  hoveredCircleId: number | null;
}

const RADIUS = 4;
const FADED_OPACITY = 0.2;

export function renderCircles(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  options: RenderCirclesOptions,
) {
  const { data, xScale, yScale, hoveredCircleId } = options;

  svg
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', RADIUS)
    .attr('fill', 'black')
    .attr('opacity', (d) =>
      hoveredCircleId === null || d.id === hoveredCircleId ? 1 : FADED_OPACITY,
    );
}
