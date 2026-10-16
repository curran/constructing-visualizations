import type { Selection } from 'd3-selection';
import type { ScaleBand, ScaleLinear, ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import type { SpeciesDatum } from './useAggregatedData';
import { barDuration, barStaggerMaxDelay } from './config';

export interface RenderBarsOptions {
  data: SpeciesDatum[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
}

export function renderBars(
  bars: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBarsOptions,
) {
  const { data, xScale, yScale, colorScale } = options;

  // Spread a small fixed delay across the bars so they grow in a gentle
  // cascade rather than all at once when the measure changes.
  const delayPerItem = barStaggerMaxDelay / Math.max(data.length, 1);

  // New bars start collapsed at the baseline so the transition can grow them.
  const baseline = yScale(0);

  const rects = bars
    .selectAll<SVGRectElement, SpeciesDatum>('rect')
    // Key the join by species so updating the measure moves the same bars
    // rather than replacing them.
    .data(data, (datum) => datum.species)
    .join((enter) =>
      enter
        .append('rect')
        .attr('x', (datum) => xScale(datum.species) ?? 0)
        .attr('y', baseline)
        .attr('height', 0)
        .attr('width', xScale.bandwidth())
        .attr('fill', (datum) => colorScale(datum.species)),
    );

  rects
    .transition('bars')
    .delay((_datum, index) => index * delayPerItem)
    .duration(barDuration)
    .attr('x', (datum) => xScale(datum.species) ?? 0)
    .attr('y', (datum) => yScale(datum.value))
    .attr('width', xScale.bandwidth())
    .attr('height', (datum) => baseline - yScale(datum.value))
    .attr('fill', (datum) => colorScale(datum.species));
}
