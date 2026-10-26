import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { easeLinear } from 'd3-ease';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import {
  barDuration,
  barFill,
  barHoverFill,
  barStaggerMaxDelay,
  binEnd,
  binFrequency,
  binGap,
  binStart,
  type HistogramBin,
} from './config';

export interface RenderBarsOptions {
  bins: HistogramBin[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  hoveredBin: HistogramBin | null;
  onHoverBin: (bin: HistogramBin | null) => void;
}

export function renderBars(
  bars: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBarsOptions,
) {
  const { bins, xScale, yScale, hoveredBin, onHoverBin } = options;

  // Spread a small delay across the bars so a change of bin count reads as the
  // distribution reorganizing itself rather than as a sudden replacement.
  const delayPerItem = barStaggerMaxDelay / Math.max(bins.length, 1);

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
    // Join by position in the array. Keeping the i-th visible bar lets it morph
    // when the bins change, even though its boundaries and count both move.
    .data(bins)
    .join(
      (enter) =>
        enter
          .append('rect')
          .attr('x', barX)
          .attr('y', baseline)
          .attr('width', barWidth)
          .attr('height', 0)
          .attr('fill', barFill),
      (update) => update,
      // When the new bin count is smaller, collapse the surplus bars instead of
      // leaving them behind.
      (exit) =>
        exit
          .transition('bars')
          .duration(barDuration)
          .attr('y', baseline)
          .attr('height', 0)
          .remove(),
    );

  rects
    .on('mouseenter', (_event, bin) => onHoverBin(bin))
    .on('mouseleave', () => onHoverBin(null))
    // The hover color is set immediately rather than transitioned, so the bar
    // under the pointer responds at the same moment as the text readout.
    .attr('fill', (bin) => (bin === hoveredBin ? barHoverFill : barFill));

  rects
    .transition('bars')
    // Linear easing keeps the bars steady while the bin-count slider is being
    // dragged; each new value restarts the transition, and an ease curve would
    // read as the bars repeatedly speeding up and slowing down.
    .ease(easeLinear)
    .delay((_bin, index) => index * delayPerItem)
    .duration(barDuration)
    .attr('x', barX)
    .attr('y', barTop)
    .attr('width', barWidth)
    .attr('height', barHeight);
}
