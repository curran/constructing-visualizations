import type { PenguinRow } from './usePenguinsDataset';
import type { Margin } from './margin';

// Chart configuration. All tweakable values live here in one place so they
// can be adjusted without hunting through the components and render functions.
export const margin: Margin = { top: 60, right: 30, bottom: 60, left: 80 };
export const title = 'Palmer Penguins';
export const titleFontSize = 20;
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 40;
export const yAxisLabelOffset = 40;

// Marks configuration.
export const markRadius = 3;
export const hoveredMarkRadius = 5;

// Interaction configuration shared by the marks and the color legend.
export const fadedOpacity = 0.2;
export const transitionDuration = 300;

// Position animation. The per-item stagger makes the marks flow into their
// new positions whenever an encoding changes, rather than snapping.
export const circleStaggerMaxDelay = 500;
export const circleDuration = 800;
export const axisTransitionDelay = 100;
export const axisTransitionDuration = 600;

// Color encoding for the species legend.
export const colorValue = (row: PenguinRow) => row.species;
export const colorRange = ['#4E79A7', '#F28E2B', '#59A14F'];

// The numeric columns the menus can map to the x and y axes. Each column
// carries its own accessor and axis label so the chart derives everything it
// needs from the selected keys.
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

// Horizontal color legend configuration. The legend lives in the header as its
// own small SVG, laid out left to right rather than stacked vertically.
export const colorLegendLabel = 'Species';
export const colorLegendLabelWidth = 64;
export const colorLegendHeight = 40;
export const colorLegendTickSpacing = 120;
export const colorLegendTickPadding = 14;
export const colorLegendDotRadius = 7;
export const colorLegendFontSize = 14;
