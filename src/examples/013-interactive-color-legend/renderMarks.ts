import type { Selection } from 'd3-selection';
import type { ScaleLinear, ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { fadedOpacity, markRadius, transitionDuration } from './config';

export interface RenderMarksOptions {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<string, string>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
  colorValue: (row: PenguinRow) => string;
  hoveredSpecies: string | null;
}

export function renderMarks(
  marks: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderMarksOptions,
) {
  const { data, xScale, yScale, colorScale, xValue, yValue, colorValue, hoveredSpecies } = options;

  marks
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('r', markRadius)
    .attr('fill', (d) => colorScale(colorValue(d)))
    // Fade the marks that do not match the hovered species. A D3 transition
    // animates the opacity so the highlight change feels smooth.
    .transition()
    .duration(transitionDuration)
    .style('opacity', (d) =>
      hoveredSpecies === null || colorValue(d) === hoveredSpecies ? 1 : fadedOpacity,
    );
}
