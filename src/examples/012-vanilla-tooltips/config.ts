import type { PenguinRow } from '../006-loading-and-summarizing-data/usePenguinsDataset';
import type { Margin } from './margin';

// Accessors extract the x and y values from each row of the dataset.
export const xValue = (row: PenguinRow) => row.bill_length_mm;
export const yValue = (row: PenguinRow) => row.bill_depth_mm;

// Chart configuration. All tweakable values live here in one place so they
// can be adjusted without hunting through the components and render functions.
export const margin: Margin = { top: 60, right: 20, bottom: 60, left: 80 };
export const title = 'Palmer Penguins';
export const titleFontSize = 20;
export const xAxisLabel = 'Bill Length (mm)';
export const yAxisLabel = 'Bill Depth (mm)';
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 40;
export const yAxisLabelOffset = 40;
