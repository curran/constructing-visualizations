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
  onHoverSpecies: (species: string | null) => void;
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
    onHoverSpecies,
  } = options;

  // Spread a fixed maximum delay across the marks so they cascade into their
  // new positions instead of all moving at once.
  const delayPerItem = scatterStaggerMaxDelay / Math.max(data.length, 1);

  const circles = marks
    .selectAll<SVGCircleElement, PenguinRow>('circle')
    .data(data)
    .join('circle')
    .attr('fill', (d) => colorScale(colorValue(d)))
    // Hovering a single record reports its species, which highlights that
    // species everywhere else on the screen.
    .on('mouseenter', (_event, d) => onHoverSpecies(colorValue(d)))
    .on('mouseleave', () => onHoverSpecies(null));

  // Positions use their own named transition so the slow, staggered move
  // between encodings can coexist with the quick hover response below.
  circles
    .transition('position')
    .delay((_d, i) => i * delayPerItem)
    .duration(scatterDuration)
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)));

  // Radius and opacity respond immediately to hovering: the marks of the
  // hovered species stay fully opaque and the rest fade.
  circles
    .transition('appearance')
    .duration(transitionDuration)
    .attr('r', (d) => (colorValue(d) === hoveredSpecies ? hoveredMarkRadius : markRadius))
    .style('opacity', (d) =>
      hoveredSpecies !== null && colorValue(d) !== hoveredSpecies ? fadedOpacity : 1,
    );
}
