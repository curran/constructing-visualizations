import type { Selection } from 'd3-selection';
import type { ScaleLinear, ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import type { PenguinRow } from './usePenguinsDataset';
import {
  circleDuration,
  circleStaggerMaxDelay,
  fadedOpacity,
  hoveredMarkRadius,
  markRadius,
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
  hoveredIndex: number | null;
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
    hoveredIndex,
  } = options;

  // Spread a fixed maximum delay across the marks so they cascade into their
  // new positions instead of all moving at once.
  const delayPerItem = circleStaggerMaxDelay / Math.max(data.length, 1);

  const circles = marks
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('fill', (d) => colorScale(colorValue(d)));

  // Positions use their own named transition so a slow, staggered move between
  // encodings can coexist with the quick hover response below. Because these
  // transitions target different attributes, they run concurrently.
  circles
    .transition('position')
    .delay((_d, i) => i * delayPerItem)
    .duration(circleDuration)
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)));

  // Radius and opacity respond immediately to hovering: the hovered mark grows
  // and everything else fades. A species hovered in the legend fades the marks
  // of the other species.
  circles
    .transition('appearance')
    .duration(transitionDuration)
    .attr('r', (_d, i) => (i === hoveredIndex ? hoveredMarkRadius : markRadius))
    .style('opacity', (d, i) => {
      if (hoveredSpecies !== null && colorValue(d) !== hoveredSpecies) return fadedOpacity;
      if (hoveredIndex !== null && i !== hoveredIndex) return fadedOpacity;
      return 1;
    });
}
