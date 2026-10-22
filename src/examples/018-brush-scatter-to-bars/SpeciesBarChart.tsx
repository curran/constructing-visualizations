import type { ScaleOrdinal } from 'd3-scale';
import { useDimensions } from './useDimensions';
import { useAggregatedData } from './useAggregatedData';
import { useBarScales } from './useBarScales';
import { BackgroundBars } from './BackgroundBars';
import { Bars } from './Bars';
import { BarChartAxes } from './BarChartAxes';
import { BarChartLabels } from './BarChartLabels';
import { barColorValue, barXValue, barYValue, margin, type Measure } from './config';
import type { PenguinRow } from './usePenguinsDataset';

export interface SpeciesBarChartProps {
  allRows: PenguinRow[] | null;
  selectedRows: PenguinRow[] | null;
  species: string[] | null;
  measure: Measure;
  colorScale: ScaleOrdinal<string, string> | null;
  hoveredSpecies: string | null;
  onHoverSpecies: (species: string | null) => void;
}

// The derived view, drawn as two layers over one shared scale. The background
// aggregates every row; the foreground aggregates the rows the brush selected.
// Reading the solid bars against the faded ones answers "how does this subset
// differ from the whole?", which is the question a coordinated selection is
// usually asked.
//
// Both layers are measured against the same global domain, so the axis holds
// still while the brush moves. `species` fixes the bar order and keeps a zero
// bar for any species the selection excludes, so the bars never swap places.
export function SpeciesBarChart({
  allRows,
  selectedRows,
  species,
  measure,
  colorScale,
  hoveredSpecies,
  onHoverSpecies,
}: SpeciesBarChartProps) {
  const { ref: divRef, dimensions } = useDimensions();

  const totalAggregated = useAggregatedData(allRows, measure, species);
  const selectedAggregated = useAggregatedData(selectedRows, measure, species);

  const scales = useBarScales({
    data: totalAggregated,
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
        aria-label={`Bar chart of Palmer Penguins showing ${measure.label} by species, with all penguins faded in the background and the brushed selection solid in the foreground`}
      >
        {totalAggregated &&
          selectedAggregated &&
          scales &&
          colorScale &&
          dimensions.width > 0 &&
          dimensions.height > 0 && (
            <>
              <BackgroundBars
                data={totalAggregated}
                xScale={scales.xScale}
                yScale={scales.yScale}
                colorScale={colorScale}
                xValue={barXValue}
                yValue={barYValue}
                colorValue={barColorValue}
              />
              <Bars
                data={selectedAggregated}
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
