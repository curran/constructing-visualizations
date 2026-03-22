import type { ComponentType } from 'react'
import { PseudoScatterPlot } from './PseudoScatterPlot'
import { PseudoBarChart } from './PseudoBarChart'
import { PseudoLineChart } from './PseudoLineChart'

export interface Example {
  name: string
  component: ComponentType
}

export const examples: Example[] = [
  {
    name: 'Pseudo Scatter Plot',
    component: PseudoScatterPlot,
  },
  {
    name: 'Pseudo Bar Chart',
    component: PseudoBarChart,
  },
  {
    name: 'Pseudo Line Chart',
    component: PseudoLineChart,
  },
]

export const examplesMap = new Map(examples.map(ex => [ex.name, ex]))

export const defaultExample = examples[0].name
