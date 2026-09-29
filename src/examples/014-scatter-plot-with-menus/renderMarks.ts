import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { circleDuration, circleStaggerMaxDelay, markRadius } from './config';

export interface RenderMarksOptions {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
}

export function renderMarks(
  marks: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderMarksOptions,
) {
  const { data, xScale, yScale, xValue, yValue } = options;

  // Spread a fixed maximum delay across the marks so they cascade into their
  // new positions instead of all moving at once.
  const delayPerItem = circleStaggerMaxDelay / Math.max(data.length, 1);

  marks
    .selectAll('circle')
    .data(data)
    .join('circle')
    .transition()
    .delay((_d, i) => i * delayPerItem)
    .duration(circleDuration)
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('r', markRadius);
}
