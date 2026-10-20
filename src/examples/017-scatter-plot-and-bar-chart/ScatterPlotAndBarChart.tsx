import { useMemo, useState } from 'react';
import { usePenguinsDataset } from './usePenguinsDataset';
import { useColorScale } from './useColorScale';
import { ScatterPlot } from './ScatterPlot';
import { SpeciesBarChart } from './SpeciesBarChart';
import { EncodingMenu } from './EncodingMenu';
import { MeasureMenu } from './MeasureMenu';
import {
  columns,
  defaultMeasureKey,
  defaultXKey,
  defaultYKey,
  getColumn,
  getMeasure,
  measures,
} from './config';

// Two views of one dataset. The parent loads the rows once, builds the shared
// color scale once, and owns the shared interaction state (`hoveredSpecies`).
// Each child view then applies its own transformation and its own scales. This
// is the first example where a single set of records drives two coordinated
// visualizations.
export function ScatterPlotAndBarChart() {
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

  // The one piece of shared interaction state. Either view can set it, and
  // both views read it to decide which marks to fade.
  const [hoveredSpecies, setHoveredSpecies] = useState<string | null>(null);

  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex flex-wrap items-end gap-6 px-4 py-3 border-b border-gray-200">
        <EncodingMenu label="X Axis" value={xKey} onChange={setXKey} options={columns} />
        <EncodingMenu label="Y Axis" value={yKey} onChange={setYKey} options={columns} />
        <MeasureMenu value={measureKey} onChange={setMeasureKey} options={measures} />
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <ScatterPlot
          data={data}
          colorScale={colorScale}
          xColumn={xColumn}
          yColumn={yColumn}
          hoveredSpecies={hoveredSpecies}
          onHoverSpecies={setHoveredSpecies}
        />
        <SpeciesBarChart
          data={data}
          measure={measure}
          colorScale={colorScale}
          hoveredSpecies={hoveredSpecies}
          onHoverSpecies={setHoveredSpecies}
        />
      </div>
    </div>
  );
}
