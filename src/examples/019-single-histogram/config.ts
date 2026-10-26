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

// Histogram bars. Every bar encodes a count with length, so one flat color is
// enough; the hovered bar fades slightly to show which interval the readout
// describes.
export const barFill = 'black';
export const hoveredBarOpacity = 0.65;
export const binGap = 1;

// Bars and axes share one duration so an old generation shrinks away at the
// same speed the new generation grows. Linear easing keeps interrupted
// transitions, such as those produced by dragging the bin slider, from
// lurching between curves.
export const transitionDuration = 800;

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
//
// The key distinguishes one manufactured set of intervals from the next. Every
// bar receives a key built from the actual number of bins d3 produced and the
// bar's index. When the actual count stays the same, old and new keys match and
// the bars update in place; when it changes, the old bars leave and the new
// bars enter.
export interface HistogramBin extends Bin<PenguinRow, number> {
  key: string;
}

export const binStart = (bin: HistogramBin) => bin.x0 ?? 0;
export const binEnd = (bin: HistogramBin) => bin.x1 ?? 0;
export const binFrequency = (bin: HistogramBin) => bin.length;
export const binKey = (bin: HistogramBin) => bin.key;

// The readout spells out the interval boundaries, which is the part of a
// histogram that the bars themselves cannot show precisely.
export function formatBinRange(bin: HistogramBin, attribute: NumericAttribute): string {
  return `${attribute.format(binStart(bin))}–${attribute.format(binEnd(bin))} ${attribute.unit}`;
}

// Counts are whole penguins, so the y axis should only offer whole-number ticks.
export const countFormat = (value: number) => integerFormat.format(value);
