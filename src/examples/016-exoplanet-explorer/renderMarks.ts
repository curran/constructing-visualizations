import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import type { ColorColumn } from './config';
import type { ExoplanetRow } from './useExoplanetsDataset';
import type { ColorScale } from './useColorScale';
import {
  circleDuration,
  circleStaggerMaxDelay,
  fadedOpacity,
  hoveredMarkRadius,
  markRadius,
  transitionDuration,
} from './config';

export interface RenderMarksOptions {
  data: ExoplanetRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ColorScale;
  xValue: (row: ExoplanetRow) => number;
  yValue: (row: ExoplanetRow) => number;
  colorColumn: ColorColumn;
  hoveredCategory: string | null;
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
    colorColumn,
    hoveredCategory,
    hoveredIndex,
  } = options;

  // Spread a fixed maximum delay across the marks so they cascade into their
  // new positions instead of all moving at once.
  const delayPerItem = circleStaggerMaxDelay / Math.max(data.length, 1);

  const circles = marks
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('fill', (d) => {
      if (colorColumn.type === 'categorical' && colorScale.type === 'categorical') {
        return colorScale.scale(colorColumn.accessor(d));
      }
      if (colorColumn.type === 'quantitative' && colorScale.type === 'quantitative') {
        return colorScale.scale(colorColumn.accessor(d));
      }
      return '#9ca3af';
    });

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
  // and everything else fades. A category hovered in the legend fades marks
  // from the other categories.
  circles
    .transition('appearance')
    .duration(transitionDuration)
    .attr('r', (_d, i) => (i === hoveredIndex ? hoveredMarkRadius : markRadius))
    .style('opacity', (d, i) => {
      if (
        hoveredCategory !== null &&
        colorColumn.type === 'categorical' &&
        colorColumn.accessor(d) !== hoveredCategory
      ) {
        return fadedOpacity;
      }
      if (hoveredIndex !== null && i !== hoveredIndex) return fadedOpacity;
      return 1;
    });
}
