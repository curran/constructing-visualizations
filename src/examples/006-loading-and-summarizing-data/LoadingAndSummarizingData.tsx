import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { useDimensions } from '../005-responsive-pseudo-scatter-plot/useDimensions';
import { usePenguinsDataset } from './usePenguinsDataset';
import { useRowsAndColumnsSummary } from './useRowsAndColumnsSummary';
import { renderTextSummary } from './renderTextSummary';

export function LoadingAndSummarizingData() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const data = usePenguinsDataset();
  const summary = useRowsAndColumnsSummary(data);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0 || !summary) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const label = `Rows: ${summary.rows}, Columns: ${summary.columns}`;

    renderTextSummary(select(svg), { centerX, centerY, label });
  }, [dimensions, summary]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Summary of the Palmer Penguins dataset"
      ></svg>
    </div>
  );
}
