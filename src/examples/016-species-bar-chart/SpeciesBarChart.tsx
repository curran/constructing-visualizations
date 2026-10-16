import { useMemo, useState } from 'react';
import { usePenguinsDataset } from './usePenguinsDataset';
import { useAggregatedData } from './useAggregatedData';
import { useColorScale } from './useColorScale';
import { useDimensions } from './useDimensions';
import { useScales } from './useScales';
import { Bars } from './Bars';
import { Axes } from './Axes';
import { Labels } from './Labels';
import { MeasureMenu } from './MeasureMenu';
import {
  colorValue,
  defaultMeasureKey,
  getMeasure,
  margin,
  measures,
  title,
  xValue,
  yValue,
} from './config';

// The species bar chart: a measure menu over a responsive bar chart. It turns
// the penguin rows into one bar per species, then lets the reader choose which
// aggregate the bar heights encode (count, or the mean of a measurement).
export function SpeciesBarChart() {
  const data = usePenguinsDataset();
  const [measureKey, setMeasureKey] = useState(defaultMeasureKey);
  const measure = useMemo(() => getMeasure(measureKey), [measureKey]);
  const aggregated = useAggregatedData(data, measure);
  const { ref: divRef, dimensions } = useDimensions();
  const colorScale = useColorScale(aggregated, colorValue);

  const scales = useScales({
    data: aggregated,
    width: dimensions.width,
    height: dimensions.height,
    margin,
    xValue,
    yValue,
  });

  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex flex-wrap items-center gap-6 px-4 py-3 border-b border-gray-200">
        <MeasureMenu value={measureKey} onChange={setMeasureKey} options={measures} />
      </header>

      <div ref={divRef} className="relative flex-1 min-h-0">
        <svg
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={`Bar chart of ${title} by species showing ${measure.label}`}
        >
          {aggregated && scales && colorScale && dimensions.width > 0 && dimensions.height > 0 && (
            <>
              <Bars
                data={aggregated}
                xScale={scales.xScale}
                yScale={scales.yScale}
                colorScale={colorScale}
                xValue={xValue}
                yValue={yValue}
                colorValue={colorValue}
              />
              <Axes
                xScale={scales.xScale}
                yScale={scales.yScale}
                height={dimensions.height}
                yTickFormat={measure.format}
              />
              <Labels
                width={dimensions.width}
                height={dimensions.height}
                measureLabel={measure.label}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
