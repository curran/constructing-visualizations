import type { Selection } from 'd3-selection';
import type { ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import { fadedOpacity, transitionDuration } from './config';

export interface RenderColorLegendOptions {
  colorScale: ScaleOrdinal<string, string>;
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
  tickSpacing: number;
  tickPadding: number;
  dotRadius: number;
  fontSize: number;
  columns: number;
}

// A horizontal categorical color legend. Hovering a tick highlights that
// category in the plot.
export function renderColorLegend(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderColorLegendOptions,
) {
  const {
    colorScale,
    hoveredCategory,
    setHoveredCategory,
    tickSpacing,
    tickPadding,
    dotRadius,
    fontSize,
    columns,
  } = options;

  const ticks = group
    .selectAll<SVGGElement, string>('g.tick')
    .data(colorScale.domain())
    .join((enter) => {
      const tick = enter.append('g').attr('class', 'tick');
      tick.append('circle');
      tick.append('text');
      return tick;
    })
    .attr(
      'transform',
      (_d, i) => `translate(${(i % columns) * tickSpacing}, ${Math.floor(i / columns) * 22})`,
    )
    .style('cursor', 'pointer')
    .style('user-select', 'none')
    .on('mouseover', (_event, d) => setHoveredCategory(d))
    .on('mouseout', () => setHoveredCategory(null));

  ticks
    .select('circle')
    .attr('r', dotRadius)
    .attr('fill', (d) => colorScale(d));

  ticks
    .select('text')
    .attr('x', tickPadding)
    .attr('dy', '0.32em')
    .attr('font-size', fontSize)
    .attr('font-family', 'sans-serif')
    .text((d) => d);

  // Fade the ticks that do not match the hovered category. A D3 transition
  // animates the opacity so the highlight change feels smooth.
  ticks
    .transition()
    .duration(transitionDuration)
    .style('opacity', (d) =>
      hoveredCategory === null || d === hoveredCategory ? 1 : fadedOpacity,
    );
}
