import { useMemo } from 'react';
import type { ScaleOrdinal } from 'd3-scale';
import { useDimensions } from './useDimensions';
import { useScatterScales } from './useScatterScales';
import { Marks } from './Marks';
import { ScatterAxes } from './ScatterAxes';
import { ScatterLabels } from './ScatterLabels';
import { BrushOverlay } from './BrushOverlay';
import { createBrushPredicate, margin, type DomainRect, type NumericColumn } from './config';
import type { PenguinRow } from './usePenguinsDataset';

export interface ScatterPlotProps {
  data: PenguinRow[] | null;
  colorScale: ScaleOrdinal<string, string> | null;
  xColumn: NumericColumn;
  yColumn: NumericColumn;
  hoveredSpecies: string | null;
  brushRange: DomainRect | null;
  onBrush: (rect: DomainRect | null) => void;
}

// The source view. It consumes the full dataset and encodes two chosen numeric
// columns as position. Every mark stays on screen; the brush simply fades the
// marks outside the selection and reports the selected interval upward, where
// the parent turns it into the rows that feed the bar chart.
export function ScatterPlot({
  data,
  colorScale,
  xColumn,
  yColumn,
  hoveredSpecies,
  brushRange,
  onBrush,
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

  // The brush rectangle inverted back into data space is enough to decide which
  // marks are selected; the same predicate drives the parent's filtering, so
  // the marks and the bars always agree on what is selected.
  const isSelected = useMemo(
    () => createBrushPredicate(brushRange, xColumn.accessor, yColumn.accessor),
    [brushRange, xColumn, yColumn],
  );

  return (
    <div ref={divRef} className="relative flex-1 min-w-0 min-h-0">
      <svg
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={`Scatter plot of Palmer Penguins showing ${xColumn.label} against ${yColumn.label}, colored by species, with a brush to select a region`}
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
              isSelected={isSelected}
            />
            <ScatterAxes xScale={scales.xScale} yScale={scales.yScale} height={dimensions.height} />
            <ScatterLabels
              width={dimensions.width}
              height={dimensions.height}
              xLabel={xColumn.label}
              yLabel={yColumn.label}
            />
            {/* The brush sits on top so it can capture the pointer drag. It is
                re-created when the scales change, and re-projects the stored
                selection onto them. */}
            <BrushOverlay
              xScale={scales.xScale}
              yScale={scales.yScale}
              width={dimensions.width}
              height={dimensions.height}
              range={brushRange}
              onBrush={onBrush}
            />
          </>
        )}
      </svg>
    </div>
  );
}
