import type { Selection } from 'd3-selection';

const FONT_SIZE = 28;

interface RenderTextSummaryOptions {
  centerX: number;
  centerY: number;
  label: string;
}

export function renderTextSummary(
  selection: Selection<SVGSVGElement, unknown, null, undefined>,
  options: RenderTextSummaryOptions,
) {
  const { centerX, centerY, label } = options;

  selection
    .selectAll('text')
    .data([null])
    .join('text')
    .attr('x', centerX)
    .attr('y', centerY)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', FONT_SIZE)
    .text(label);
}
