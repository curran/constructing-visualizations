import type { Selection } from 'd3-selection';
import type { ScaleLinear, ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import type { PenguinRow } from './usePenguinsDataset';
import { fadedOpacity, markRadius, scatterDuration, scatterStaggerMaxDelay } from './config';

export interface RenderMarksOptions {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
  colorValue: (row: PenguinRow) => string;
  hoveredSpecies: string | null;
  isSelected: (row: PenguinRow) => boolean;
}

export function renderMarks(
  marks: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderMarksOptions,
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
    isSelected,
  } = options;

  // Spread a fixed maximum delay across the marks so they cascade into their
  // new positions instead of all moving at once.
  const delayPerItem = scatterStaggerMaxDelay / Math.max(data.length, 1);

  const circles = marks
    .selectAll<SVGCircleElement, PenguinRow>('circle')
    .data(data)
    .join('circle')
    // Every mark is the same size. Emphasis is carried by opacity alone, so a
    // hover never resizes or moves a mark.
    .attr('r', markRadius)
    .attr('fill', (d) => colorScale(colorValue(d)));

  // Position is the only thing on a mark that animates: the slow, staggered
  // move between encodings.
  circles
    .transition('position')
    .delay((_d, i) => i * delayPerItem)
    .duration(scatterDuration)
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)));

  // Opacity is set directly rather than transitioned, so the fade lands exactly
  // when the brush or the hover changes.
  //
  // A mark is drawn at full strength only when it is inside the selection and,
  // if a species is hovered in the bar chart, belongs to that species.
  // Everything else takes the same faded opacity the bars use, so the two views
  // tell the same story about what is currently in focus.
  circles.style('opacity', (d) =>
    isSelected(d) && (hoveredSpecies === null || colorValue(d) === hoveredSpecies)
      ? 1
      : fadedOpacity,
  );
}
