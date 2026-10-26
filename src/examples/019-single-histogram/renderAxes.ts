import { axisBottom, axisLeft } from 'd3-axis';
import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import { axisTransitionDelay, axisTransitionDuration, countFormat } from './config';

export interface RenderAxesOptions {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xTickFormat: (value: number) => string;
}

export function renderAxes(
  axes: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderAxesOptions,
) {
  const { xScale, yScale, xTickFormat } = options;

  // Counts are whole penguins, so drop any fractional ticks that a small
  // maximum count would otherwise produce.
  const integerTicks = yScale.ticks(5).filter((value) => Number.isInteger(value));

  // The axes group is a React-rendered container for the axes. The axis
  // generators fill the positioned x and y axis groups with a domain line and
  // ticks, transitioning between attributes and bin counts rather than snapping.
  axes
    .select<SVGGElement>('g.x-axis')
    .transition()
    .delay(axisTransitionDelay)
    .duration(axisTransitionDuration)
    .call(
      axisBottom(xScale)
        .ticks(8)
        .tickFormat((value) => xTickFormat(Number(value))),
    );

  axes
    .select<SVGGElement>('g.y-axis')
    .transition()
    .delay(axisTransitionDelay)
    .duration(axisTransitionDuration)
    .call(
      axisLeft(yScale)
        .tickValues(integerTicks)
        .tickFormat((value) => countFormat(Number(value))),
    );
}
