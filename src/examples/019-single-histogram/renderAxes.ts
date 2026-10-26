import { axisBottom, axisLeft } from 'd3-axis';
import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { easeLinear } from 'd3-ease';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import { countFormat, transitionDuration } from './config';

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
  const xTicks = xScale.ticks(8);

  const xAxis = axes.select<SVGGElement>('g.x-axis');
  const yAxis = axes.select<SVGGElement>('g.y-axis');

  // A slow axis transition is pleasant for a single change, but dragging the
  // slider interrupts the previous transition before its exiting ticks have
  // finished fading. Those abandoned ticks can pile up and overlap the current
  // labels. Drop any tick that is not part of the new set before transitioning,
  // so only the current scale's ticks remain. Ticks that survive then animate
  // smoothly to their new positions.
  removeStaleTicks(xAxis, xTicks);
  removeStaleTicks(yAxis, integerTicks);

  // The axes group is a React-rendered container for the axes. The axis
  // generators fill the positioned x and y axis groups with a domain line and
  // ticks, transitioning between attributes and bin counts rather than snapping.
  xAxis
    .transition()
    .ease(easeLinear)
    .duration(transitionDuration)
    .call(
      axisBottom(xScale)
        .ticks(8)
        .tickFormat((value) => xTickFormat(Number(value))),
    );

  yAxis
    .transition()
    .ease(easeLinear)
    .duration(transitionDuration)
    .call(
      axisLeft(yScale)
        .tickValues(integerTicks)
        .tickFormat((value) => countFormat(Number(value))),
    );
}

function removeStaleTicks(
  axis: Selection<SVGGElement, unknown, null, undefined>,
  tickValues: number[],
) {
  const keep = new Set(tickValues);
  const seen = new Set<number>();

  axis
    .selectAll<SVGGElement, number>('g.tick')
    .filter((value) => {
      if (!keep.has(value) || seen.has(value)) return true;
      seen.add(value);
      return false;
    })
    .remove();
}
