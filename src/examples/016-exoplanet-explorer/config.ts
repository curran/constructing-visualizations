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

export interface NumericColumn {
  key: string;
  label: string;
  accessor: (row: ExoplanetRow) => number;
}

export const columns: NumericColumn[] = [
  { key: 'pl_rade', label: 'Planet Radius (Earth radii)', accessor: (row) => row.pl_rade },
  { key: 'pl_bmasse', label: 'Planet Mass (Earth masses)', accessor: (row) => row.pl_bmasse },
  { key: 'pl_orbper', label: 'Orbital Period (days)', accessor: (row) => row.pl_orbper },
  { key: 'disc_year', label: 'Discovery Year', accessor: (row) => row.disc_year },
  { key: 'st_teff', label: 'Stellar Temperature (K)', accessor: (row) => row.st_teff },
  { key: 'ra', label: 'Right Ascension (degrees)', accessor: (row) => row.ra },
  { key: 'dec', label: 'Declination (degrees)', accessor: (row) => row.dec },
];

export const defaultXKey = 'pl_rade';
export const defaultYKey = 'pl_orbper';

export function getColumn(key: string): NumericColumn {
  return columns.find((column) => column.key === key) ?? columns[0];
}

export type ColorColumn =
  | {
      key: string;
      label: string;
      type: 'categorical';
      accessor: (row: ExoplanetRow) => string;
    }
  | {
      key: string;
      label: string;
      type: 'quantitative';
      accessor: (row: ExoplanetRow) => number;
    };

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
  {
    key: 'disc_year',
    label: 'Discovery Year',
    type: 'quantitative',
    accessor: (row) => row.disc_year,
  },
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
];

export const defaultColorKey = 'planet_type';

export function getColorColumn(key: string): ColorColumn {
  return colorColumns.find((column) => column.key === key) ?? colorColumns[0];
}

export const colorLegendLabelWidth = 150;
export const colorLegendHeight = 40;
export const colorLegendTickSpacing = 120;
export const colorLegendTickPadding = 14;
export const colorLegendDotRadius = 7;
export const colorLegendFontSize = 14;
export const colorLegendWidth = 220;
