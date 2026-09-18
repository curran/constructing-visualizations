import type { Selection } from 'd3-selection';
import type { ScaleOrdinal } from 'd3-scale';
// Importing d3-transition augments selections with the `.transition()` method.
import 'd3-transition';

const FADED_OPACITY = 0.2;
const TRANSITION_DURATION = 300;

export interface RenderColorLegendOptions {
  colorScale: ScaleOrdinal<string, string>;
  x: number;
  y: number;
  hoveredSpecies: string | null;
  setHoveredSpecies: (species: string | null) => void;
  label: string;
  labelOffset: number;
  tickSpacing: number;
  tickPadding: number;
  dotRadius: number;
  fontSize: number;
}

export function renderColorLegend(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderColorLegendOptions,
) {
  const {
    colorScale,
    x,
    y,
    hoveredSpecies,
    setHoveredSpecies,
    label,
    labelOffset,
    tickSpacing,
    tickPadding,
    dotRadius,
    fontSize,
  } = options;

  const legend = group.attr('transform', `translate(${x}, ${y})`);

  legend
    .selectAll('text.color-legend-label')
    .data([null])
    .join('text')
    .attr('class', 'color-legend-label')
    .attr('x', 0)
    .attr('y', labelOffset)
    .attr('font-size', fontSize)
    .attr('font-family', 'sans-serif')
    .text(label);

  // Each legend tick is a color swatch plus its species name. Hovering a tick
  // sets the hovered species, which every layer derives its appearance from.
  const ticks = legend
    .selectAll<SVGGElement, string>('g.tick')
    .data(colorScale.domain())
    .join((enter) => {
      const tick = enter.append('g').attr('class', 'tick');
      tick.append('circle');
      tick.append('text');
      return tick;
    })
    .attr('transform', (_d, i) => `translate(0, ${i * tickSpacing})`)
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
    .duration(TRANSITION_DURATION)
    .style('opacity', (d) => (hoveredSpecies === null || d === hoveredSpecies ? 1 : FADED_OPACITY));
}
