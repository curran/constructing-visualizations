import { useInteraction } from './InteractionContext';
import {
  axisLabelFontSize,
  margin,
  title,
  titleFontSize,
  xAxisLabelOffset,
  yAxisLabelOffset,
} from './config';

export interface LabelsProps {
  width: number;
  height: number;
}

// Static text, so rendered as JSX rather than through a D3 data join. The axis
// labels follow whichever columns are currently encoded on the axes.
export function Labels({ width, height }: LabelsProps) {
  const { xColumn, yColumn } = useInteraction();

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
        {xColumn.label}
      </text>
      <text
        className="y-axis-label"
        transform={`translate(${margin.left - yAxisLabelOffset}, ${plotCenterY}) rotate(-90)`}
        textAnchor="middle"
        fontSize={axisLabelFontSize}
      >
        {yColumn.label}
      </text>
    </g>
  );
}
