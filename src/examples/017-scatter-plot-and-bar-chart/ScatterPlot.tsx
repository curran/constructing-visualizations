import { useMemo } from 'react';
import type { ScaleOrdinal } from 'd3-scale';
import { useDimensions } from './useDimensions';
import { useScatterScales } from './useScatterScales';
import { Marks } from './Marks';
import { ScatterAxes } from './ScatterAxes';
import { ScatterLabels } from './ScatterLabels';
import { margin, type NumericColumn } from './config';
import type { PenguinRow } from './usePenguinsDataset';

export interface ScatterPlotProps {
  data: PenguinRow[] | null;
  colorScale: ScaleOrdinal<string, string> | null;
  xColumn: NumericColumn;
  yColumn: NumericColumn;
  hoveredSpecies: string | null;
}

// One of the two coordinated views. It consumes the full dataset, drops any
// rows with missing measurements, and encodes two chosen numeric columns as
// position. Its color and its hover state both come from the parent, which is
// what links it to the bar chart.
export function ScatterPlot({
  data,
  colorScale,
  xColumn,
  yColumn,
  hoveredSpecies,
}: ScatterPlotProps) {
  const { ref: divRef, dimensions } = useDimensions();

  // Some rows in the dataset have missing measurements (NA), which would map to
  // undefined circle positions and render as stray dots at the origin. Drop
  // those rows so every remaining row maps to a valid circle.
  const rows = useMemo(
    () =>
      data?.filter(
        (row) => Number.isFinite(xColumn.accessor(row)) && Number.isFinite(yColumn.accessor(row)),
      ) ?? null,
    [data, xColumn, yColumn],
  );

  const scales = useScatterScales({
    data: rows,
    width: dimensions.width,
    height: dimensions.height,
    margin,
    xValue: xColumn.accessor,
    yValue: yColumn.accessor,
  });

  return (
    <div ref={divRef} className="relative flex-1 min-w-0 min-h-0">
      <svg
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={`Scatter plot of Palmer Penguins showing ${xColumn.label} against ${yColumn.label}, colored by species`}
      >
        {rows && scales && colorScale && dimensions.width > 0 && dimensions.height > 0 && (
          <>
            <Marks
              data={rows}
              xScale={scales.xScale}
              yScale={scales.yScale}
              colorScale={colorScale}
              xValue={xColumn.accessor}
              yValue={yColumn.accessor}
              hoveredSpecies={hoveredSpecies}
            />
            <ScatterAxes xScale={scales.xScale} yScale={scales.yScale} height={dimensions.height} />
            <ScatterLabels
              width={dimensions.width}
              height={dimensions.height}
              xLabel={xColumn.label}
              yLabel={yColumn.label}
            />
          </>
        )}
      </svg>
    </div>
  );
}
