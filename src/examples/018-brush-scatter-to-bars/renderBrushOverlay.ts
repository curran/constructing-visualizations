import { brush } from 'd3-brush';
import type { BrushBehavior, D3BrushEvent } from 'd3-brush';
import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { brushFill, brushFillOpacity, brushStroke, margin, type DomainRect } from './config';

// A pixel rectangle: [[left, top], [right, bottom]].
type RectSelection = [[number, number], [number, number]];

export interface RenderBrushOverlayOptions {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  width: number;
  height: number;
  // The committed selection in data space, or null. The overlay is re-created
  // whenever the scales change, and this is what it re-projects from.
  range: DomainRect | null;
  onBrush: (rect: DomainRect | null) => void;
}

// Pixels are only one projection of the selection; the data-space interval is
// the source of truth, so it can be projected onto whatever scales are current.
function projectRange(
  range: DomainRect,
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
): RectSelection {
  return [
    [xScale(range.x[0]), yScale(range.y[1])],
    [xScale(range.x[1]), yScale(range.y[0])],
  ];
}

function invertSelection(
  selection: RectSelection,
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
): DomainRect {
  const [[x0, y0], [x1, y1]] = selection;

  // The y scale is flipped, so the top pixel of the brush maps to the larger
  // data value. Normalize both intervals to low-to-high as we invert.
  return {
    x: [xScale.invert(Math.min(x0, x1)), xScale.invert(Math.max(x0, x1))],
    y: [yScale.invert(Math.max(y0, y1)), yScale.invert(Math.min(y0, y1))],
  };
}

// A rectangular brush constrained to the plot area. While the gesture moves we
// invert the pixel rectangle through the scales into data space and report that
// interval upward; the parent turns the interval into a predicate over the rows.
// An empty selection reports null, which clears the filter and returns the bar
// chart to the full dataset.
export function renderBrushOverlay(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBrushOverlayOptions,
) {
  const { xScale, yScale, width, height, range, onBrush } = options;

  // Re-projecting the stored interval is a programmatic sync, not a gesture, so
  // its events must not be reported back to React as a new selection.
  let reprojecting = false;

  const brushBehavior: BrushBehavior<unknown> = brush<unknown>()
    .extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ])
    .on('brush end', (event: D3BrushEvent<unknown>) => {
      if (reprojecting) return;

      const selection = event.selection as RectSelection | null;
      onBrush(selection ? invertSelection(selection, xScale, yScale) : null);
    });

  group.call(brushBehavior);

  // d3-brush keeps whatever pixel rectangle the group already carries, so after
  // a resize or a change of encoding the previous rectangle would linger on
  // screen, measured against scales that no longer exist. Re-project the stored
  // data-space interval (or clear it) so the rectangle always agrees with the
  // marks and with the rows feeding the bar chart.
  reprojecting = true;
  brushBehavior.move(group, range ? projectRange(range, xScale, yScale) : null);
  reprojecting = false;

  // d3-brush generates the overlay and selection elements; restyle the
  // selection rectangle so it matches the rest of the example.
  group
    .select<SVGRectElement>('.selection')
    .attr('fill', brushFill)
    .attr('fill-opacity', brushFillOpacity)
    .attr('stroke', brushStroke);
}
