import { mean } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';
import type { Margin } from './margin';

// Shared configuration for the two coordinated views. Keeping every tweakable
// value here keeps the scatter plot and the bar chart visually consistent even
// though they are otherwise independent projections of the same records.
export const margin: Margin = { top: 60, right: 30, bottom: 60, left: 80 };
export const titleFontSize = 20;
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 40;
export const yAxisLabelOffset = 40;

// One title per view.
export const scatterTitle = 'Palmer Penguins';
export const barChartTitle = 'Species Summary';

// Animation. Marks and bars stagger into place so a change of encoding reads as
// a transition rather than a jump, and the two views feel like one system.
export const scatterStaggerMaxDelay = 500;
export const scatterDuration = 800;
// The bars follow the brush, so their transition has to be short enough to keep
// up with it: a new selection arrives every `brushThrottleInterval`, and a much
// longer transition would leave the bars permanently chasing the pointer. The
// marks can afford to be slower — they only move when the encoding changes.
export const barDuration = 200;
export const barStaggerMaxDelay = 300;
export const axisTransitionDelay = 100;
export const axisTransitionDuration = 600;

// Scatter plot marks. Every mark is the same size: hovering a species carries
// its emphasis through opacity alone.
export const markRadius = 3;

// Coordinated highlighting. When a species is hovered in either view, the marks
// and bars that do not belong to it fade, so the two views reveal that they are
// showing the same records.
export const fadedOpacity = 0.15;
export const transitionDuration = 300;

// Brush styling. The selection rectangle marks the region of the scatter plot
// whose rows feed the bar chart.
export const brushFill = '#4E79A7';
export const brushFillOpacity = 0.12;
export const brushStroke = '#4E79A7';

// Brushing fires continuously while the pointer moves. Cap how often the
// selection reaches React state at this interval, so the bar chart recomputes
// at most ten times a second instead of on every mousemove.
export const brushThrottleInterval = 100;

// Bar chart geometry.
export const barPadding = 0.25;

// Color encoding for species, shared by the scatter plot marks and the bars.
export const colorRange = ['#4E79A7', '#F28E2B', '#59A14F'];
export const colorValue = (row: PenguinRow) => row.species;

// The numeric columns the scatter plot menus can map to the x and y axes. Each
// column carries its own accessor and axis label so the chart derives
// everything it needs from the selected keys.
export interface NumericColumn {
  key: string;
  label: string;
  accessor: (row: PenguinRow) => number;
}

export const columns: NumericColumn[] = [
  { key: 'bill_length_mm', label: 'Bill Length (mm)', accessor: (row) => row.bill_length_mm },
  { key: 'bill_depth_mm', label: 'Bill Depth (mm)', accessor: (row) => row.bill_depth_mm },
  {
    key: 'flipper_length_mm',
    label: 'Flipper Length (mm)',
    accessor: (row) => row.flipper_length_mm,
  },
  { key: 'body_mass_g', label: 'Body Mass (g)', accessor: (row) => row.body_mass_g },
];

export const defaultXKey = 'bill_length_mm';
export const defaultYKey = 'bill_depth_mm';

export function getColumn(key: string): NumericColumn {
  return columns.find((column) => column.key === key) ?? columns[0];
}

// A brush selection expressed in data space rather than pixels. Each interval
// is stored low-to-high, so it reads like a numeric range even though the y
// scale is flipped on screen.
export interface DomainRect {
  x: [number, number];
  y: [number, number];
}

// This is the heart of the example: turning a brushed rectangle into a data
// predicate. The pixels have already been inverted through the scales into
// `rect`; here we simply test every row against that interval. Rows with
// missing measurements fail the comparisons automatically, so they are never
// selected. With no rectangle, every row passes and the bar chart shows the
// full dataset.
export function createBrushPredicate(
  rect: DomainRect | null,
  xValue: (row: PenguinRow) => number,
  yValue: (row: PenguinRow) => number,
): (row: PenguinRow) => boolean {
  if (!rect) return () => true;

  const [xMin, xMax] = rect.x;
  const [yMin, yMax] = rect.y;

  return (row) => {
    const x = xValue(row);
    const y = yValue(row);
    return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
  };
}

// One aggregated bar: a species and the value for the selected measure. The
// accessors below describe how each datum maps onto the visual channels, so the
// bar scales, bars, and colors all agree on the same mapping.
export interface SpeciesDatum {
  species: string;
  value: number;
}

export const barXValue = (datum: SpeciesDatum) => datum.species;
export const barYValue = (datum: SpeciesDatum) => datum.value;
export const barColorValue = (datum: SpeciesDatum) => datum.species;

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

// A measure is the aggregation applied to each species group in the bar chart.
// Keeping the aggregate, label, and number format together makes the measure
// menu and the axis derive everything from one selected value.
export interface Measure {
  key: string;
  label: string;
  aggregate: (rows: PenguinRow[]) => number;
  format: (value: number) => string;
}

export const measures: Measure[] = [
  {
    key: 'count',
    label: 'Count',
    aggregate: (rows) => rows.length,
    format: (value) => integerFormat.format(value),
  },
  {
    key: 'mean_body_mass_g',
    label: 'Mean Body Mass (g)',
    aggregate: (rows) => mean(rows, (row) => row.body_mass_g) ?? 0,
    format: (value) => integerFormat.format(value),
  },
  {
    key: 'mean_flipper_length_mm',
    label: 'Mean Flipper Length (mm)',
    aggregate: (rows) => mean(rows, (row) => row.flipper_length_mm) ?? 0,
    format: (value) => oneDecimalFormat.format(value),
  },
  {
    key: 'mean_bill_length_mm',
    label: 'Mean Bill Length (mm)',
    aggregate: (rows) => mean(rows, (row) => row.bill_length_mm) ?? 0,
    format: (value) => oneDecimalFormat.format(value),
  },
];

export const defaultMeasureKey = 'count';

export function getMeasure(key: string): Measure {
  return measures.find((measure) => measure.key === key) ?? measures[0];
}
