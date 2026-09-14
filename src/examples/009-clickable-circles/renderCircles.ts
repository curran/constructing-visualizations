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
  selectedCircleId: number | null;
  setSelectedCircleId: (id: number) => void;
}

const RADIUS = 34;

export function renderCircles(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  options: RenderCirclesOptions,
) {
  const { data, xScale, yScale, selectedCircleId, setSelectedCircleId } = options;

  svg
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', RADIUS)
    .attr('fill', (d) => (d.id === selectedCircleId ? 'white' : 'black'))
    .attr('stroke', (d) => (d.id === selectedCircleId ? 'black' : 'none'))
    .attr('stroke-width', 5)
    .style('cursor', 'pointer')
    .on('click', (_event, d) => {
      setSelectedCircleId(d.id);
    });
}
