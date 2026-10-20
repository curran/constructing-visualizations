import type { Selection } from 'd3-selection';
import type { ScaleBand, ScaleLinear, ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import {
  barDuration,
  barStaggerMaxDelay,
  fadedOpacity,
  transitionDuration,
  type SpeciesDatum,
} from './config';

export interface RenderBarsOptions {
  data: SpeciesDatum[];
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
  xValue: (datum: SpeciesDatum) => string;
  yValue: (datum: SpeciesDatum) => number;
  colorValue: (datum: SpeciesDatum) => string;
  hoveredSpecies: string | null;
  onHoverSpecies: (species: string | null) => void;
}

export function renderBars(
  bars: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBarsOptions,
) {
  const {
    data,
    xScale,
    yScale,
    colorScale,
    xValue,
    yValue,
    colorValue,
    hoveredSpecies,
    onHoverSpecies,
  } = options;

  // Spread a small fixed delay across the bars so they grow in a gentle
  // cascade rather than all at once when the measure changes.
  const delayPerItem = barStaggerMaxDelay / Math.max(data.length, 1);

  // New bars start collapsed at the baseline so the transition can grow them.
  const baseline = yScale(0);

  const rects = bars
    .selectAll<SVGRectElement, SpeciesDatum>('rect')
    // Key the join by the x accessor so updating the measure moves the same
    // bars rather than replacing them.
    .data(data, xValue)
    .join((enter) =>
      enter
        .append('rect')
        .attr('x', (d) => xScale(xValue(d)) ?? 0)
        .attr('y', baseline)
        .attr('height', 0)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d) => colorScale(colorValue(d))),
    )
    // Hovering a bar reports its species, which highlights that species in the
    // scatter plot as well.
    .on('mouseenter', (_event, d) => onHoverSpecies(colorValue(d)))
    .on('mouseleave', () => onHoverSpecies(null));

  rects
    .transition('bars')
    .delay((_d, i) => i * delayPerItem)
    .duration(barDuration)
    .attr('x', (d) => xScale(xValue(d)) ?? 0)
    .attr('y', (d) => yScale(yValue(d)))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => baseline - yScale(yValue(d)))
    .attr('fill', (d) => colorScale(colorValue(d)));

  // Fade the bars that do not match the hovered species quickly, so the
  // coordinated highlight reads even while the bars are still growing.
  rects
    .transition('appearance')
    .duration(transitionDuration)
    .style('opacity', (d) =>
      hoveredSpecies !== null && colorValue(d) !== hoveredSpecies ? fadedOpacity : 1,
    );
}
