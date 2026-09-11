import { axisBottom, axisLeft } from 'd3-axis';
import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';

export interface RenderAxesOptions {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function renderAxes(
  guides: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderAxesOptions,
) {
  const { xScale, yScale } = options;

  // The guides group is a React-rendered container for the axes. The
  // axis generators fill the positioned x and y axis groups with a
  // domain line and ticks.
  guides.select<SVGGElement>('g.x-axis').call(axisBottom(xScale));
  guides.select<SVGGElement>('g.y-axis').call(axisLeft(yScale));
}
