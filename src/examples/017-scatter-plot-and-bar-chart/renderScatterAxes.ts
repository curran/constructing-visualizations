import { axisBottom, axisLeft } from 'd3-axis';
import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import { axisTransitionDelay, axisTransitionDuration } from './config';

export interface RenderScatterAxesOptions {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function renderScatterAxes(
  axes: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderScatterAxesOptions,
) {
  const { xScale, yScale } = options;

  // The axes group is a React-rendered container for the axes. The axis
  // generators fill the positioned x and y axis groups with a domain line and
  // ticks, transitioning between encodings rather than snapping.
  axes
    .select<SVGGElement>('g.x-axis')
    .transition()
    .delay(axisTransitionDelay)
    .duration(axisTransitionDuration)
    .call(axisBottom(xScale));

  axes
    .select<SVGGElement>('g.y-axis')
    .transition()
    .delay(axisTransitionDelay)
    .duration(axisTransitionDuration)
    .call(axisLeft(yScale));
}
