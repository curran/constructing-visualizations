import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import type { Margin } from './margin';

// Accessors extract the x, y, and color values from each row of the dataset.
export const xValue = (row: PenguinRow) => row.bill_length_mm;
export const yValue = (row: PenguinRow) => row.bill_depth_mm;
export const colorValue = (row: PenguinRow) => row.species;

// A small colorblind-friendly palette for the three penguin species.
export const colorRange = ['#4E79A7', '#F28E2B', '#59A14F'];

// Chart configuration. All tweakable values live here in one place so they
// can be adjusted without hunting through the components and render functions.
// The right margin is wide enough to hold the color legend.
export const margin: Margin = { top: 60, right: 150, bottom: 60, left: 80 };
export const title = 'Palmer Penguins';
export const titleFontSize = 20;
export const xAxisLabel = 'Bill Length (mm)';
export const yAxisLabel = 'Bill Depth (mm)';
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 40;
export const yAxisLabelOffset = 40;

// Color legend configuration.
export const colorLegendLabel = 'Species';
export const colorLegendTickSpacing = 30;
export const colorLegendTickPadding = 15;
export const colorLegendLabelOffset = -24;
export const colorLegendDotRadius = 7;
export const colorLegendFontSize = 14;
