import { useCallback, useMemo, useState } from 'react';
import { usePenguinsDataset } from './usePenguinsDataset';
import { useColorScale } from './useColorScale';
import { useThrottledCallback } from './useThrottledCallback';
import { ScatterPlot } from './ScatterPlot';
import { SpeciesBarChart } from './SpeciesBarChart';
import { EncodingMenu } from './EncodingMenu';
import { MeasureMenu } from './MeasureMenu';
import {
  brushThrottleInterval,
  columns,
  createBrushPredicate,
  defaultMeasureKey,
  defaultXKey,
  defaultYKey,
  getColumn,
  getMeasure,
  measures,
  type DomainRect,
} from './config';

// A brush turns a region of the scatter plot into a filter. The parent owns the
// selection, converts it to a predicate over the rows, and feeds the matching
// rows to the bar chart, which re-aggregates them. This is the first example
// where an interaction in one view changes the data another view is built from.
export function BrushScatterToBars() {
  const data = usePenguinsDataset();
  const colorScale = useColorScale(data);

  // Encoding state for the scatter plot.
  const [xKey, setXKey] = useState(defaultXKey);
  const [yKey, setYKey] = useState(defaultYKey);
  const xColumn = useMemo(() => getColumn(xKey), [xKey]);
  const yColumn = useMemo(() => getColumn(yKey), [yKey]);

  // Measure state for the bar chart.
  const [measureKey, setMeasureKey] = useState(defaultMeasureKey);
  const measure = useMemo(() => getMeasure(measureKey), [measureKey]);

  // The two pieces of shared interaction state: a transient hover that focuses
  // one species, and a persistent brush that filters the records.
  const [hoveredSpecies, setHoveredSpecies] = useState<string | null>(null);
  const [brushRange, setBrushRange] = useState<DomainRect | null>(null);

  // Changing an encoding moves every mark, so the old pixel rectangle no longer
  // means the same thing. Clear the brush whenever the axes change.
  const handleXChange = useCallback((key: string) => {
    setXKey(key);
    setBrushRange(null);
  }, []);

  const handleYChange = useCallback((key: string) => {
    setYKey(key);
    setBrushRange(null);
  }, []);

  // Brushing emits a new rectangle on every pointer move. Throttling the
  // setter keeps the selection responsive at the leading edge while capping the
  // recomputation at one update per interval; the trailing edge commits the
  // final rectangle when the gesture ends.
  const handleBrush = useThrottledCallback(setBrushRange, brushThrottleInterval);

  // Turn the brushed interval into the rows that fall inside it. With no brush
  // every row passes, so the solid bars start out matching the faded ones and
  // return to them when the selection is cleared.
  const filteredData = useMemo(() => {
    if (!data || !brushRange) return data;
    return data.filter(createBrushPredicate(brushRange, xColumn.accessor, yColumn.accessor));
  }, [data, brushRange, xColumn, yColumn]);

  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex flex-wrap items-end gap-6 px-4 py-3 border-b border-gray-200">
        <EncodingMenu label="X Axis" value={xKey} onChange={handleXChange} options={columns} />
        <EncodingMenu label="Y Axis" value={yKey} onChange={handleYChange} options={columns} />
        <MeasureMenu value={measureKey} onChange={setMeasureKey} options={measures} />
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <ScatterPlot
          data={data}
          colorScale={colorScale}
          xColumn={xColumn}
          yColumn={yColumn}
          hoveredSpecies={hoveredSpecies}
          brushRange={brushRange}
          onBrush={handleBrush}
        />
        <SpeciesBarChart
          data={data}
          filteredData={filteredData}
          measure={measure}
          colorScale={colorScale}
          hoveredSpecies={hoveredSpecies}
          onHoverSpecies={setHoveredSpecies}
        />
      </div>
    </div>
  );
}
