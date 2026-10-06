import type { ExoplanetRow } from './useExoplanetsDataset';
import type { Margin } from './margin';

export const margin: Margin = { top: 60, right: 30, bottom: 60, left: 80 };
export const title = 'NASA Confirmed Exoplanets';
export const titleFontSize = 20;
export const axisLabelFontSize = 14;
export const xAxisLabelOffset = 40;
export const yAxisLabelOffset = 40;

export const markRadius = 3;
export const hoveredMarkRadius = 5;
export const fadedOpacity = 0.2;
export const transitionDuration = 300;
export const circleStaggerMaxDelay = 500;
export const circleDuration = 800;
export const axisTransitionDelay = 100;
export const axisTransitionDuration = 600;

export interface EncodingOption {
  key: string;
  label: string;
}

export interface NumericColumn extends EncodingOption {
  type: 'quantitative';
  accessor: (row: ExoplanetRow) => number;
}

export interface CategoricalColumn extends EncodingOption {
  type: 'categorical';
  accessor: (row: ExoplanetRow) => string;
}

export type ColorColumn = NumericColumn | CategoricalColumn;

export const columns: NumericColumn[] = [
  {
    key: 'pl_rade',
    label: 'Planet Radius (Earth radii)',
    type: 'quantitative',
    accessor: (row) => row.pl_rade,
  },
  {
    key: 'pl_bmasse',
    label: 'Planet Mass (Earth masses)',
    type: 'quantitative',
    accessor: (row) => row.pl_bmasse,
  },
  {
    key: 'pl_orbper',
    label: 'Orbital Period (days)',
    type: 'quantitative',
    accessor: (row) => row.pl_orbper,
  },
  {
    key: 'st_teff',
    label: 'Stellar Temperature (K)',
    type: 'quantitative',
    accessor: (row) => row.st_teff,
  },
  {
    key: 'disc_year',
    label: 'Discovery Year',
    type: 'quantitative',
    accessor: (row) => row.disc_year,
  },
  {
    key: 'ra',
    label: 'Right Ascension (degrees)',
    type: 'quantitative',
    accessor: (row) => row.ra,
  },
  { key: 'dec', label: 'Declination (degrees)', type: 'quantitative', accessor: (row) => row.dec },
];

export const colorColumns: ColorColumn[] = [
  {
    key: 'planet_type',
    label: 'Planet Type',
    type: 'categorical',
    accessor: (row) => row.planet_type,
  },
  {
    key: 'discoverymethod',
    label: 'Discovery Method',
    type: 'categorical',
    accessor: (row) => row.discoverymethod,
  },
  ...columns,
];

export const defaultXKey = 'pl_rade';
export const defaultYKey = 'pl_orbper';
export const defaultColorKey = 'planet_type';

export function getColumn(key: string): NumericColumn {
  return columns.find((column) => column.key === key) ?? columns[0];
}

export function getColorColumn(key: string): ColorColumn {
  return colorColumns.find((column) => column.key === key) ?? colorColumns[0];
}

export const colorRange = ['#4E79A7', '#F28E2B', '#59A14F', '#E15759', '#B07AA1'];
export const missingColor = '#9ca3af';
export const colorLegendHeight = 40;
export const colorLegendLabelWidth = 110;
export const colorLegendTickSpacing = 140;
export const colorLegendTickPadding = 14;
export const colorLegendDotRadius = 7;
export const colorLegendFontSize = 14;
