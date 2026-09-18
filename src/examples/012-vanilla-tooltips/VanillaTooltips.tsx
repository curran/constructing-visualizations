import { useEffect, useMemo, useState } from 'react';
import { useDimensions } from './useDimensions';
import { usePenguinsDataset } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { useScales } from './useScales';
import { Marks } from './Marks';
import { Axes } from './Axes';
import { Labels } from './Labels';
import { VoronoiOverlay } from './VoronoiOverlay';
import { Tooltip } from './Tooltip';
import { margin, xValue, yValue } from './config';
import type { TooltipState } from './renderVoronoiOverlay';

const numberFormat = new Intl.NumberFormat('en-US');

export function VanillaTooltips() {
  const { ref: divRef, dimensions } = useDimensions();
  const data = usePenguinsDataset();

  // The single piece of interaction state. D3 fills in the viewport
  // coordinates of the hovered mark's anchor point; React just renders a
  // tooltip from it.
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [showVoronoi, setShowVoronoi] = useState(false);

  // Some rows in the dataset have missing measurements (NA), which would
  // map to undefined circle positions and render as stray dots at the
  // origin. Drop those rows so every remaining row maps to a valid circle.
  const rows = useMemo(
    () =>
      data?.filter((row) => Number.isFinite(xValue(row)) && Number.isFinite(yValue(row))) ?? null,
    [data],
  );

  const scales = useScales({ data: rows, ...dimensions, margin, xValue, yValue });

  // Easter egg: pressing "V" toggles the Voronoi cell borders on and off.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'v') {
        setShowVoronoi((shown) => !shown);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // The tooltip state is the logical anchor; the highlighted mark and the
  // tooltip contents are both derived from it.
  const hoveredIndex = tooltip?.index ?? null;
  const hoveredRow = hoveredIndex === null || rows === null ? null : (rows[hoveredIndex] ?? null);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Scatter plot of Palmer Penguins bill length and bill depth with hover tooltips"
      >
        {rows && scales && dimensions.width > 0 && dimensions.height > 0 && (
          <>
            <Marks
              data={rows}
              xScale={scales.xScale}
              yScale={scales.yScale}
              xValue={xValue}
              yValue={yValue}
              hoveredIndex={hoveredIndex}
            />
            <VoronoiOverlay
              data={rows}
              xScale={scales.xScale}
              yScale={scales.yScale}
              xValue={xValue}
              yValue={yValue}
              width={dimensions.width}
              height={dimensions.height}
              margin={margin}
              setTooltip={setTooltip}
              showVoronoi={showVoronoi}
            />
            <Axes
              xScale={scales.xScale}
              yScale={scales.yScale}
              height={dimensions.height}
              margin={margin}
            />
            <Labels width={dimensions.width} height={dimensions.height} margin={margin} />
          </>
        )}
      </svg>
      {tooltip && hoveredRow && (
        <Tooltip x={tooltip.x} y={tooltip.y}>
          <div className="font-medium">{hoveredRow.species}</div>
          <div>Bill length: {hoveredRow.bill_length_mm} mm</div>
          <div>Bill depth: {hoveredRow.bill_depth_mm} mm</div>
          {Number.isFinite(hoveredRow.body_mass_g) && (
            <div>Body mass: {numberFormat.format(hoveredRow.body_mass_g)} g</div>
          )}
        </Tooltip>
      )}
    </div>
  );
}
