import { useMemo, useState } from 'react';
import { useDimensions } from './useDimensions';
import { usePenguinsDataset } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { useScales } from './useScales';
import { useColorScale } from './useColorScale';
import { Marks } from './Marks';
import { Axes } from './Axes';
import { Labels } from './Labels';
import { ColorLegend } from './ColorLegend';
import { colorLegendTickSpacing, colorValue, margin, xValue, yValue } from './config';

export function InteractiveColorLegend() {
  const { ref: divRef, dimensions } = useDimensions();
  const data = usePenguinsDataset();
  const [hoveredSpecies, setHoveredSpecies] = useState<string | null>(null);

  // Some rows in the dataset have missing measurements (NA), which would
  // map to undefined circle positions and render as stray dots at the
  // origin. Drop those rows so every remaining row maps to a valid circle.
  const rows = useMemo(
    () =>
      data?.filter((row) => Number.isFinite(xValue(row)) && Number.isFinite(yValue(row))) ?? null,
    [data],
  );

  const scales = useScales({ data: rows, ...dimensions, margin, xValue, yValue });
  const colorScale = useColorScale(rows);

  // The legend lives in the right margin band, vertically centered on the
  // plot area so it stays clear of the marks at any container size.
  const legendTickCount = colorScale ? colorScale.domain().length : 0;
  const legendHeight = Math.max(legendTickCount - 1, 0) * colorLegendTickSpacing;
  const plotCenterY = margin.top + (dimensions.height - margin.top - margin.bottom) / 2;
  const legendX = dimensions.width - margin.right + 20;
  const legendY = plotCenterY - legendHeight / 2;

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Scatter plot of Palmer Penguins bill length and bill depth, colored by species, with an interactive color legend"
      >
        {rows && scales && colorScale && dimensions.width > 0 && dimensions.height > 0 && (
          <>
            <Marks
              data={rows}
              xScale={scales.xScale}
              yScale={scales.yScale}
              colorScale={colorScale}
              xValue={xValue}
              yValue={yValue}
              colorValue={colorValue}
              hoveredSpecies={hoveredSpecies}
            />
            <Axes
              xScale={scales.xScale}
              yScale={scales.yScale}
              height={dimensions.height}
              margin={margin}
            />
            <Labels width={dimensions.width} height={dimensions.height} margin={margin} />
            <ColorLegend
              colorScale={colorScale}
              x={legendX}
              y={legendY}
              hoveredSpecies={hoveredSpecies}
              setHoveredSpecies={setHoveredSpecies}
            />
          </>
        )}
      </svg>
    </div>
  );
}
