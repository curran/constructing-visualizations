import type { ComponentType } from 'react';
import { PseudoScatterPlot } from './001-pseudo-scatter-plot/PseudoScatterPlot';
import { PseudoBarChart } from './002-pseudo-bar-chart/PseudoBarChart';
import { PseudoLineChart } from './003-pseudo-line-chart/PseudoLineChart';
import { RespondingToResize } from './004-responding-to-resize/RespondingToResize';
import { ResponsivePseudoScatterPlot } from './005-responsive-pseudo-scatter-plot/ResponsivePseudoScatterPlot';
import { LoadingAndSummarizingData } from './006-loading-and-summarizing-data/LoadingAndSummarizingData';
import { ScatterplotBasic } from './007-scatterplot-basic/ScatterplotBasic';
import { ScatterPlot } from './008-scatter-plot/ScatterPlot';
import { ClickableCircles } from './009-clickable-circles/ClickableCircles';
import { Hovering } from './010-hovering/Hovering';
import { Tooltips } from './011-tooltips/Tooltips';
import { VanillaTooltips } from './012-vanilla-tooltips/VanillaTooltips';

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
  {
    id: '6',
    name: 'Loading and Summarizing Data',
    component: LoadingAndSummarizingData,
  },
  {
    id: '7',
    name: 'Scatterplot Basic',
    component: ScatterplotBasic,
  },
  {
    id: '8',
    name: 'Scatter Plot',
    component: ScatterPlot,
  },
  {
    id: '9',
    name: 'Clickable Circles',
    component: ClickableCircles,
  },
  {
    id: '10',
    name: 'Hovering',
    component: Hovering,
  },
  {
    id: '11',
    name: 'Tooltips',
    component: Tooltips,
  },
  {
    id: '12',
    name: 'Vanilla Tooltips',
    component: VanillaTooltips,
  },
];

export const examplesMap = new Map(examples.map((ex) => [ex.id, ex]));

export const defaultExample = '1';
