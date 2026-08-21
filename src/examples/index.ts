import type { ComponentType } from 'react';
import { PseudoScatterPlot } from './001-pseudo-scatter-plot/PseudoScatterPlot';
import { PseudoBarChart } from './002-pseudo-bar-chart/PseudoBarChart';
import { PseudoLineChart } from './003-pseudo-line-chart/PseudoLineChart';
import { RespondingToResize } from './004-responding-to-resize/RespondingToResize';
import { ResponsivePseudoScatterPlot } from './005-responsive-pseudo-scatter-plot/ResponsivePseudoScatterPlot';

export interface Example {
  id: string;
  name: string;
  component: ComponentType;
}

export const examples: Example[] = [
  {
    id: '1',
    name: 'Pseudo Scatter Plot',
    component: PseudoScatterPlot,
  },
  {
    id: '2',
    name: 'Pseudo Bar Chart',
    component: PseudoBarChart,
  },
  {
    id: '3',
    name: 'Pseudo Line Chart',
    component: PseudoLineChart,
  },
  {
    id: '4',
    name: 'Responding to Resize',
    component: RespondingToResize,
  },
  {
    id: '5',
    name: 'Responsive Pseudo Scatter Plot',
    component: ResponsivePseudoScatterPlot,
  },
];

export const examplesMap = new Map(examples.map((ex) => [ex.id, ex]));

export const defaultExample = '1';
