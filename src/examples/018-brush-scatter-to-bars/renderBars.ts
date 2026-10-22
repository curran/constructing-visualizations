import type { Selection } from 'd3-selection';
import type { ScaleBand, ScaleLinear, ScaleOrdinal } from 'd3-scale';
import { easeLinear } from 'd3-ease';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import {
  barDuration,
  barStaggerMaxDelay,
  fadedOpacity,
  margin,
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
  // Opacity for this layer when no species is hovered. The background layer
  // draws the whole dataset at the faded opacity; the foreground layer draws
  // the selection solid.
  baseOpacity: number;
  // Hover is optional so the background layer can stay inert behind the
  // selection. When set, hovering a bar reports its species, which highlights
  // that species in the scatter plot too.
  hoveredSpecies?: string | null;
  onHoverSpecies?: (species: string | null) => void;
}

// One join and one pair of transitions, shared by both bar layers. Keeping them
// in a single function means the background and the selection always grow with
// the same timing and easing.
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
    baseOpacity,
    hoveredSpecies,
    onHoverSpecies,
  } = options;

  // Spread a small fixed delay across the bars so they grow in a gentle
  // cascade rather than all at once when the measure or selection changes.
  const delayPerItem = barStaggerMaxDelay / Math.max(data.length, 1);

  // New bars start collapsed at the baseline so the transition can grow them.
  const baseline = yScale(0);

  // The y scale holds the global domain, so a selection can measure taller than
  // the axis allows (a mean over a high subset, for instance). Cap such a bar at
  // the top of the plot area rather than letting it draw over the title.
  const barTop = (d: SpeciesDatum) => Math.max(margin.top, yScale(yValue(d)));

  const rects = bars
    .selectAll<SVGRectElement, SpeciesDatum>('rect')
    // Key the join by the x accessor so updating the measure or the brush moves
    // the same bars rather than replacing them.
    .data(data, xValue)
    .join((enter) =>
      enter
        .append('rect')
        .attr('x', (d) => xScale(xValue(d)) ?? 0)
        .attr('y', baseline)
        .attr('height', 0)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d) => colorScale(colorValue(d))),
    );

  if (onHoverSpecies) {
    rects
      .on('mouseenter', (_event, d) => onHoverSpecies(colorValue(d)))
      .on('mouseleave', () => onHoverSpecies(null));
  }

  rects
    .transition('bars')
    // Linear easing keeps bar growth steady. While brushing, this transition
    // restarts every throttle interval, and a curve would read as the bars
    // repeatedly speeding up and slowing down.
    .ease(easeLinear)
    .delay((_d, i) => i * delayPerItem)
    .duration(barDuration)
    .attr('x', (d) => xScale(xValue(d)) ?? 0)
    .attr('y', barTop)
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => Math.max(0, baseline - barTop(d)))
    .attr('fill', (d) => colorScale(colorValue(d)));

  // Fade the bars that do not match the hovered species quickly, so the
  // coordinated highlight reads even while the bars are still growing.
  const dimmed = hoveredSpecies ?? null;
  rects
    .transition('appearance')
    .ease(easeLinear)
    .duration(transitionDuration)
    .style('opacity', (d) =>
      dimmed !== null && colorValue(d) !== dimmed ? fadedOpacity : baseOpacity,
    );
}
