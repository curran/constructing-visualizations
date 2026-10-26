import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { easeLinear } from 'd3-ease';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import {
  barFill,
  binEnd,
  binFrequency,
  binGap,
  binKey,
  binStart,
  hoveredBarOpacity,
  transitionDuration,
  type HistogramBin,
} from './config';

export interface RenderBarsOptions {
  bins: HistogramBin[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  onHoverBin: (bin: HistogramBin | null) => void;
}

export function renderBars(
  bars: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBarsOptions,
) {
  const { bins, xScale, yScale, onHoverBin } = options;

  // Every bar grows from the baseline. The one-pixel gap separates adjacent
  // intervals, which helps the eye read the bars as discrete bins.
  const baseline = yScale(0);
  const barX = (bin: HistogramBin) => xScale(binStart(bin)) + binGap / 2;
  const barWidth = (bin: HistogramBin) =>
    Math.max(0, xScale(binEnd(bin)) - xScale(binStart(bin)) - binGap);
  const barTop = (bin: HistogramBin) => yScale(binFrequency(bin));
  const barHeight = (bin: HistogramBin) => Math.max(0, baseline - barTop(bin));

  const rects = bars
    .selectAll<SVGRectElement, HistogramBin>('rect')
    // Key each bar by the actual bin count and its index. When the count
    // changes, every key changes, so D3 exits the old bars and enters a fresh
    // set instead of morphing one geometry into another. When the count is
    // unchanged, the keys match and the bars update in place.
    .data(bins, binKey)
    .join(
      (enter) =>
        enter
          .append('rect')
          .attr('x', barX)
          .attr('y', baseline)
          .attr('width', barWidth)
          .attr('height', 0)
          .attr('fill', barFill),
      // Returning to an earlier actual bin count can reuse a bar that is still
      // shrinking. Clear its exiting marker so the new transition can reclaim
      // it instead of leaving it faded out of the hover pass.
      (update) => update.classed('exiting', false),
      // The outgoing generation shrinks back to the baseline, then leaves.
      // Removing the pointer handlers first keeps a bar that is on its way out
      // from updating the hover readout.
      (exit) =>
        exit
          .classed('exiting', true)
          // Keep the outgoing generation above the incoming bars so its shrink
          // stays visible instead of being covered by bars growing in front.
          .raise()
          .on('mouseenter', null)
          .on('mouseleave', null)
          .transition('bars')
          .ease(easeLinear)
          .duration(transitionDuration)
          .attr('y', baseline)
          .attr('height', 0)
          .remove(),
    );

  rects
    .on('mouseenter', (_event, bin) => onHoverBin(bin))
    .on('mouseleave', () => onHoverBin(null))
    .attr('fill', barFill);

  rects
    .transition('bars')
    // Linear easing keeps the bars steady while the bin-count slider is being
    // dragged; each new value restarts the transition, and an ease curve would
    // read as the bars repeatedly speeding up and slowing down.
    .ease(easeLinear)
    .duration(transitionDuration)
    .attr('x', barX)
    .attr('y', barTop)
    .attr('width', barWidth)
    .attr('height', barHeight);
}

// Hover is applied in a separate pass. Re-running the data join on every hover
// would restart the current bar transitions and the shrinking of older
// generations, so hover only changes the opacity of settled bars.
export function renderBarHighlight(
  bars: Selection<SVGGElement, unknown, null, undefined>,
  hoveredBin: HistogramBin | null,
) {
  bars
    .selectAll<SVGRectElement, HistogramBin>('rect:not(.exiting)')
    .attr('opacity', (bin) => (bin === hoveredBin ? hoveredBarOpacity : 1));
}
