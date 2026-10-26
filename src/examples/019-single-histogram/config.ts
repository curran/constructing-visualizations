import type { Bin } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';

// Margin reserves space around the plot for the title, axes, and axis labels.
export const margin = { top: 60, right: 30, bottom: 70, left: 80 };

export const title = 'Palmer Penguins';
export const titleFontSize = 20;
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 44;
export const yAxisLabelOffset = 40;
export const yAxisLabel = 'Count';

// Histogram bars. Every bar encodes a count with length, so a single hue is
// enough; the hovered bar darkens to show which interval the readout describes.
export const barFill = '#4E79A7';
export const barHoverFill = '#264F73';
export const binGap = 1;

// Animation. Bars and axes ease into their new geometry when the attribute or
// the number of bins changes, which makes the redistribution of counts legible.
export const barDuration = 300;
export const barStaggerMaxDelay = 150;
export const axisTransitionDelay = 100;
export const axisTransitionDuration = 500;

// The range slider covers the useful part of the curve where too few bins hide
// the shape and too many bins turn the histogram into noise.
export const defaultBinCount = 20;
export const minBinCount = 2;
export const maxBinCount = 50;

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Each attribute is one quantitative column the histogram can summarize. The
// accessor, label, unit, and number format travel together so the menu, scales,
// axes, and hover readout all derive their text from the selected attribute.
export interface NumericAttribute {
  key: string;
  label: string;
  unit: string;
  accessor: (row: PenguinRow) => number;
  format: (value: number) => string;
}

export const attributes: NumericAttribute[] = [
  {
    key: 'body_mass_g',
    label: 'Body Mass',
    unit: 'g',
    accessor: (row) => row.body_mass_g,
    format: (value) => integerFormat.format(value),
  },
  {
    key: 'flipper_length_mm',
    label: 'Flipper Length',
    unit: 'mm',
    accessor: (row) => row.flipper_length_mm,
    format: (value) => integerFormat.format(value),
  },
  {
    key: 'bill_length_mm',
    label: 'Bill Length',
    unit: 'mm',
    accessor: (row) => row.bill_length_mm,
    format: (value) => oneDecimalFormat.format(value),
  },
  {
    key: 'bill_depth_mm',
    label: 'Bill Depth',
    unit: 'mm',
    accessor: (row) => row.bill_depth_mm,
    format: (value) => oneDecimalFormat.format(value),
  },
];

export const defaultAttributeKey = 'body_mass_g';

export function getAttribute(key: string): NumericAttribute {
  return attributes.find((attribute) => attribute.key === key) ?? attributes[0];
}

// The x-axis label names the binned quantity and its unit.
export function attributeLabel(attribute: NumericAttribute): string {
  return `${attribute.label} (${attribute.unit})`;
}

// `d3.bin` returns arrays of rows with the interval attached. These accessors
// name the channels the histogram encodes, so the scales and bars agree on
// which part of a bin is the position and which part is the count.
export type HistogramBin = Bin<PenguinRow, number>;

export const binStart = (bin: HistogramBin) => bin.x0 ?? 0;
export const binEnd = (bin: HistogramBin) => bin.x1 ?? 0;
export const binFrequency = (bin: HistogramBin) => bin.length;

// The readout spells out the interval boundaries, which is the part of a
// histogram that the bars themselves cannot show precisely.
export function formatBinRange(bin: HistogramBin, attribute: NumericAttribute): string {
  return `${attribute.format(binStart(bin))}–${attribute.format(binEnd(bin))} ${attribute.unit}`;
}

// Counts are whole penguins, so the y axis should only offer whole-number ticks.
export const countFormat = (value: number) => integerFormat.format(value);
