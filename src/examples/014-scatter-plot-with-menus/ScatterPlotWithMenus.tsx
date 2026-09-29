import { useMemo, useState } from 'react';
import { useDimensions } from './useDimensions';
import { usePenguinsDataset } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import { useScales } from './useScales';
import { Marks } from './Marks';
import { Axes } from './Axes';
import { Labels } from './Labels';
import { EncodingMenu } from './EncodingMenu';
import { columns, defaultXKey, defaultYKey, getColumn, margin } from './config';

export function ScatterPlotWithMenus() {
  const { ref: divRef, dimensions } = useDimensions();
  const data = usePenguinsDataset();

  // The two menus drive which columns are mapped to the x and y axes.
  const [xKey, setXKey] = useState(defaultXKey);
  const [yKey, setYKey] = useState(defaultYKey);
  const { xColumn, yColumn } = useMemo(
    () => ({ xColumn: getColumn(xKey), yColumn: getColumn(yKey) }),
    [xKey, yKey],
  );

  // Some rows in the dataset have missing measurements (NA), which would
  // map to undefined circle positions and render as stray dots at the
  // origin. Drop those rows so every remaining row maps to a valid circle.
  const rows = useMemo(
    () =>
      data?.filter(
        (row) => Number.isFinite(xColumn.accessor(row)) && Number.isFinite(yColumn.accessor(row)),
      ) ?? null,
    [data, xColumn, yColumn],
  );

  const scales = useScales({
    data: rows,
    ...dimensions,
    margin,
    xValue: xColumn.accessor,
    yValue: yColumn.accessor,
  });

  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex flex-wrap items-end gap-6 px-4 py-3 border-b border-gray-200">
        <EncodingMenu label="X Axis" value={xKey} onChange={setXKey} options={columns} />
        <EncodingMenu label="Y Axis" value={yKey} onChange={setYKey} options={columns} />
      </header>

      <div ref={divRef} className="relative flex-1 min-h-0">
        <svg
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={`Scatter plot of Palmer Penguins with ${xColumn.label} on the x axis and ${yColumn.label} on the y axis`}
        >
          {rows && scales && dimensions.width > 0 && dimensions.height > 0 && (
            <>
              <Marks
                data={rows}
                xScale={scales.xScale}
                yScale={scales.yScale}
                xValue={xColumn.accessor}
                yValue={yColumn.accessor}
              />
              <Axes
                xScale={scales.xScale}
                yScale={scales.yScale}
                height={dimensions.height}
                margin={margin}
              />
              <Labels
                width={dimensions.width}
                height={dimensions.height}
                margin={margin}
                xAxisLabel={xColumn.label}
                yAxisLabel={yColumn.label}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
