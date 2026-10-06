import { useMemo } from 'react';
import { useDimensions } from './useDimensions';
import { useScales } from './useScales';
import { Marks } from './Marks';
import { Axes } from './Axes';
import { Labels } from './Labels';
import { VoronoiOverlay } from './VoronoiOverlay';
import { TooltipLayer } from './TooltipLayer';
import { EncodingMenu } from './EncodingMenu';
import { ColorLegend } from './ColorLegend';
import { useData } from './DataContext';
import { useInteraction } from './InteractionContext';
import { colorColumns, columns, margin } from './config';

// The explorer: a header of encoding menus plus the color legend, over a
// responsive scatter plot. It computes the filtered rows and the scales that
// depend on the measured dimensions, then hands that geometry to the layers.
// All semantic state (data, hover, encodings) travels through context instead.
export function Explorer() {
  const { data } = useData();
  const { xKey, setXKey, yKey, setYKey, colorKey, setColorKey, xColumn, yColumn, colorColumn } =
    useInteraction();
  const { ref: divRef, dimensions } = useDimensions();

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
      <header className="flex flex-wrap items-center gap-6 px-4 py-3 border-b border-gray-200">
        <EncodingMenu label="X Axis" value={xKey} onChange={setXKey} options={columns} />
        <EncodingMenu label="Y Axis" value={yKey} onChange={setYKey} options={columns} />
        <EncodingMenu
          label="Color"
          value={colorKey}
          onChange={setColorKey}
          options={colorColumns}
        />
        <div className="ml-auto">
          <ColorLegend />
        </div>
      </header>

      <div ref={divRef} className="relative flex-1 min-h-0">
        <svg
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={`Scatter plot of confirmed exoplanets with ${xColumn.label} on the x axis and ${yColumn.label} on the y axis, colored by ${colorColumn.label}`}
        >
          {rows && scales && dimensions.width > 0 && dimensions.height > 0 && (
            <>
              <Marks data={rows} xScale={scales.xScale} yScale={scales.yScale} />
              <VoronoiOverlay
                data={rows}
                xScale={scales.xScale}
                yScale={scales.yScale}
                width={dimensions.width}
                height={dimensions.height}
              />
              <Axes xScale={scales.xScale} yScale={scales.yScale} height={dimensions.height} />
              <Labels width={dimensions.width} height={dimensions.height} />
            </>
          )}
        </svg>
        {rows && <TooltipLayer data={rows} />}
      </div>
    </div>
  );
}
