import { mean } from 'd3-array';
import type { PenguinRow } from './usePenguinsDataset';
import type { Margin } from './margin';

// Chart configuration. All tweakable values live here in one place so they
// can be adjusted without hunting through the components and render functions.
export const margin: Margin = { top: 60, right: 30, bottom: 60, left: 80 };
export const title = 'Palmer Penguins';
export const titleFontSize = 20;
export const axisLabelFontSize = 14;
export const xAxisLabel = 'Species';
export const xAxisLabelOffset = 40;
export const yAxisLabelOffset = 40;

// Color encoding for the species bars. The species label also sits directly
// under each bar, so the color is decorative reinforcement rather than the
// only way to tell the categories apart.
export const barColorRange = ['#4E79A7', '#F28E2B', '#59A14F'];

// Animation. Bars grow up from the baseline and stagger slightly, so changing
// the measure reads as a transition rather than a jump.
export const barDuration = 800;
export const barStaggerMaxDelay = 300;
export const axisTransitionDelay = 100;
export const axisTransitionDuration = 600;
export const barPadding = 0.2;

// One aggregated bar: a species and the value for the selected measure. The
// accessors below describe how each datum maps onto the visual channels, so
// the scales, the bars, and the colors all agree on the same mapping.
export interface SpeciesDatum {
  species: string;
  value: number;
}

export const xValue = (datum: SpeciesDatum) => datum.species;
export const yValue = (datum: SpeciesDatum) => datum.value;
export const colorValue = (datum: SpeciesDatum) => datum.species;

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

// A measure is the aggregation applied to each species group. Keeping the
// accessor, label, and number format together makes the measure menu and the
// axis derive everything from one selected value.
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
