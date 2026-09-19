import type { Margin } from './margin';
import {
  axisLabelFontSize,
  title,
  titleFontSize,
  xAxisLabel,
  xAxisLabelOffset,
  yAxisLabel,
  yAxisLabelOffset,
} from './config';

export interface LabelsProps {
  width: number;
  height: number;
  margin: Margin;
}

export function Labels({ width, height, margin }: LabelsProps) {
  // The centers of the plot area define where the axis labels are centered.
  const plotCenterX = margin.left + (width - margin.left - margin.right) / 2;
  const plotCenterY = margin.top + (height - margin.top - margin.bottom) / 2;

  return (
    <g className="labels">
      <text
        className="title"
        x={width / 2}
        y={margin.top / 2}
        textAnchor="middle"
        fontSize={titleFontSize}
      >
        {title}
      </text>
      <text
        className="x-axis-label"
        x={plotCenterX}
        y={height - margin.bottom + xAxisLabelOffset}
        textAnchor="middle"
        fontSize={axisLabelFontSize}
      >
        {xAxisLabel}
      </text>
      <text
        className="y-axis-label"
        transform={`translate(${margin.left - yAxisLabelOffset}, ${plotCenterY}) rotate(-90)`}
        textAnchor="middle"
        fontSize={axisLabelFontSize}
      >
        {yAxisLabel}
      </text>
    </g>
  );
}
