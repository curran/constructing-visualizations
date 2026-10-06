import type { Selection } from 'd3-selection';
import type { ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';
import { fadedOpacity, transitionDuration } from './config';

export interface RenderColorLegendOptions {
  colorScale: ScaleOrdinal<string, string>;
  hoveredSpecies: string | null;
  setHoveredSpecies: (species: string | null) => void;
  tickSpacing: number;
  tickPadding: number;
  dotRadius: number;
  fontSize: number;
}

// A horizontal color legend. Each tick is a color swatch plus its species name,
// laid out left to right. Hovering a tick sets the hovered species, which every
// other layer derives its appearance from.
export function renderColorLegend(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderColorLegendOptions,
) {
  const {
    colorScale,
    hoveredSpecies,
    setHoveredSpecies,
    tickSpacing,
    tickPadding,
    dotRadius,
    fontSize,
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
    .attr('transform', (_d, i) => `translate(${i * tickSpacing}, 0)`)
    .style('cursor', 'pointer')
    .style('user-select', 'none')
    .on('mouseover', (_event, d) => setHoveredSpecies(d))
    .on('mouseout', () => setHoveredSpecies(null));

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

  // Fade the ticks that do not match the hovered species. A D3 transition
  // animates the opacity so the highlight change feels smooth.
  ticks
    .transition()
    .duration(transitionDuration)
    .style('opacity', (d) => (hoveredSpecies === null || d === hoveredSpecies ? 1 : fadedOpacity));
}
