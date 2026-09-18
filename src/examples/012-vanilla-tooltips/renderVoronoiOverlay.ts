import { Delaunay } from 'd3-delaunay';
import type { Selection } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import type { Margin } from './margin';

// The tooltip's anchor point in viewport coordinates, plus the index of the
// hovered row (so other layers can highlight it).
export interface TooltipState {
  x: number;
  y: number;
  index: number;
}

export interface RenderVoronoiOverlayOptions {
  data: PenguinRow[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (row: PenguinRow) => number;
  yValue: (row: PenguinRow) => number;
  width: number;
  height: number;
  margin: Margin;
  setTooltip: (tooltip: TooltipState | null) => void;
  showVoronoi: boolean;
}

// An invisible Voronoi tessellation drawn on top of the marks. Each cell
// contains exactly one data point, so a cell acts as an oversized (and
// therefore easy to hit) target for the small circle at its center. The cell
// borders are hidden unless showVoronoi is set (the "V" easter egg).
export function renderVoronoiOverlay(
  group: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderVoronoiOverlayOptions,
) {
  const { data, xScale, yScale, xValue, yValue, width, height, margin, setTooltip, showVoronoi } =
    options;

  const delaunay = Delaunay.from(
    data,
    (d) => xScale(xValue(d)),
    (d) => yScale(yValue(d)),
  );

  // Clip the tessellation to the plot area so the cells do not spill over
  // the axes and labels that live in the margins.
  const voronoi = delaunay.voronoi([
    margin.left,
    margin.top,
    width - margin.right,
    height - margin.bottom,
  ]);

  group
    .selectAll<SVGPathElement, PenguinRow>('path')
    .data(data)
    .join('path')
    .attr('d', (_d, i) => voronoi.renderCell(i))
    .attr('fill', 'none')
    .attr('stroke', showVoronoi ? 'black' : 'none')
    .attr('stroke-width', 1)
    .attr('pointer-events', 'all')
    .on('mouseover', (event, d) => {
      // The mark's position is known in SVG coordinates. Convert it to
      // viewport coordinates here, in D3, so React only ever has to render a
      // fixed-position HTML element at (x, y).
      const svg = (event.currentTarget as SVGPathElement).ownerSVGElement;
      const screenCTM = svg?.getScreenCTM();
      if (!screenCTM) return;

      const anchor = new DOMPoint(xScale(xValue(d)), yScale(yValue(d))).matrixTransform(screenCTM);

      // d3 event listeners receive (event, datum) but not the index, so look
      // the hovered row up to recover its position in the dataset.
      setTooltip({ x: anchor.x, y: anchor.y, index: data.indexOf(d) });
    })
    .on('mouseout', () => {
      setTooltip(null);
    });
}
