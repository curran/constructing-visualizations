import type { ScaleOrdinal } from 'd3-scale';
import { useDimensions } from './useDimensions';
import { useAggregatedData } from './useAggregatedData';
import { useBarScales } from './useBarScales';
import { Bars } from './Bars';
import { BarChartAxes } from './BarChartAxes';
import { BarChartLabels } from './BarChartLabels';
import { barColorValue, barXValue, barYValue, margin, type Measure } from './config';
import type { PenguinRow } from './usePenguinsDataset';

export interface SpeciesBarChartProps {
  data: PenguinRow[] | null;
  measure: Measure;
  colorScale: ScaleOrdinal<string, string> | null;
  hoveredSpecies: string | null;
  onHoverSpecies: (species: string | null) => void;
}

// The second coordinated view. It reads the same rows as the scatter plot but
// applies a different transformation: group by species, then aggregate. The
// result is one bar per species, colored with the shared scale and linked to
// the scatter plot through the shared hover state.
export function SpeciesBarChart({
  data,
  measure,
  colorScale,
  hoveredSpecies,
  onHoverSpecies,
}: SpeciesBarChartProps) {
  const { ref: divRef, dimensions } = useDimensions();
  const aggregated = useAggregatedData(data, measure);

  const scales = useBarScales({
    data: aggregated,
    width: dimensions.width,
    height: dimensions.height,
    margin,
    xValue: barXValue,
    yValue: barYValue,
  });

  return (
    <div ref={divRef} className="relative flex-1 min-w-0 min-h-0">
      <svg
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={`Bar chart of Palmer Penguins showing ${measure.label} by species`}
      >
        {aggregated && scales && colorScale && dimensions.width > 0 && dimensions.height > 0 && (
          <>
            <Bars
              data={aggregated}
              xScale={scales.xScale}
              yScale={scales.yScale}
              colorScale={colorScale}
              xValue={barXValue}
              yValue={barYValue}
              colorValue={barColorValue}
              hoveredSpecies={hoveredSpecies}
              onHoverSpecies={onHoverSpecies}
            />
            <BarChartAxes
              xScale={scales.xScale}
              yScale={scales.yScale}
              height={dimensions.height}
              yTickFormat={measure.format}
            />
            <BarChartLabels
              width={dimensions.width}
              height={dimensions.height}
              yLabel={measure.label}
            />
          </>
        )}
      </svg>
    </div>
  );
}
