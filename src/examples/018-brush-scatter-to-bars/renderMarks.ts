import type { Selection } from 'd3-selection';
import type { ScaleLinear, ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import type { PenguinRow } from './usePenguinsDataset';
import {
  fadedOpacity,
  hoveredMarkRadius,
  markRadius,
  scatterDuration,
  scatterStaggerMaxDelay,
  transitionDuration,
} from './config';

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
    .attr('fill', (d) => colorScale(colorValue(d)));

  // Positions use their own named transition so the slow, staggered move
  // between encodings can coexist with the quick appearance response below.
  circles
    .transition('position')
    .delay((_d, i) => i * delayPerItem)
    .duration(scatterDuration)
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)));

  // Opacity is set directly, not transitioned: the fade has to land exactly
  // when the brush does, and an easing curve would make the plot lag behind the
  // selection it is reporting.
  circles.style('opacity', (d) => (isSelected(d) ? 1 : fadedOpacity));

  // Radius responds to hovering a bar with a short transition, so the hovered
  // species swells rather than jumps.
  circles
    .transition('appearance')
    .duration(transitionDuration)
    .attr('r', (d) => (colorValue(d) === hoveredSpecies ? hoveredMarkRadius : markRadius));
}
