import { useCallback, useMemo, useState } from 'react';
import { usePenguinsDataset } from './usePenguinsDataset';
import { useDimensions } from './useDimensions';
import { useHistogramBins } from './useHistogramBins';
import { useScales } from './useScales';
import { Bars } from './Bars';
import { Axes } from './Axes';
import { Labels } from './Labels';
import { AttributeMenu } from './AttributeMenu';
import { BinCountSlider } from './BinCountSlider';
import {
  attributeLabel,
  attributes,
  defaultAttributeKey,
  defaultBinCount,
  formatBinRange,
  getAttribute,
  margin,
  type HistogramBin,
} from './config';

// A single histogram: one quantitative attribute is cut into intervals and the
// rows in each interval are counted. The menu changes which attribute is binned
// and the slider changes how many intervals d3.bin manufactures. Hovering a bar
// exposes the interval boundaries behind it.
export function SingleHistogram() {
  const data = usePenguinsDataset();
  const [attributeKey, setAttributeKey] = useState(defaultAttributeKey);
  const attribute = useMemo(() => getAttribute(attributeKey), [attributeKey]);
  const [binCount, setBinCount] = useState(defaultBinCount);
  const [hoveredBin, setHoveredBin] = useState<HistogramBin | null>(null);

  // Drop rows whose selected measurement is missing, so the reported row count
  // and the histogram describe exactly the same records.
  const rows = useMemo(
    () => data?.filter((row) => Number.isFinite(attribute.accessor(row))) ?? null,
    [data, attribute],
  );

  const bins = useHistogramBins(rows, attribute, binCount);
  const { ref: divRef, dimensions } = useDimensions();
  const scales = useScales({ bins, width: dimensions.width, height: dimensions.height, margin });

  // A new attribute or bin count invalidates the intervals behind the pointer.
  const handleAttributeChange = useCallback((key: string) => {
    setAttributeKey(key);
    setHoveredBin(null);
  }, []);

  const handleBinCountChange = useCallback((value: number) => {
    setBinCount(value);
    setHoveredBin(null);
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex flex-wrap items-end gap-6 px-4 py-3 border-b border-gray-200">
        <AttributeMenu value={attributeKey} onChange={handleAttributeChange} options={attributes} />
        <BinCountSlider value={binCount} onChange={handleBinCountChange} />
        {/* The readout turns each interval from a bar into an explicit range and
            count. Idle, it reports the size of the dataset and the actual number
            of bins d3 chose. */}
        <p className="ml-auto text-sm text-gray-600 tabular-nums" aria-live="polite">
          {hoveredBin
            ? `${formatBinRange(hoveredBin, attribute)}: ${hoveredBin.length} penguins`
            : rows && bins
              ? `${rows.length} penguins · ${bins.length} bins`
              : 'Loading…'}
        </p>
      </header>

      <div ref={divRef} className="relative flex-1 min-h-0">
        <svg
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={`Histogram of ${attributeLabel(attribute)} for Palmer Penguins`}
        >
          {bins && scales && dimensions.width > 0 && dimensions.height > 0 && (
            <>
              <Bars
                bins={bins}
                xScale={scales.xScale}
                yScale={scales.yScale}
                hoveredBin={hoveredBin}
                onHoverBin={setHoveredBin}
              />
              <Axes
                xScale={scales.xScale}
                yScale={scales.yScale}
                height={dimensions.height}
                xTickFormat={attribute.format}
              />
              <Labels
                width={dimensions.width}
                height={dimensions.height}
                xLabel={attributeLabel(attribute)}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
