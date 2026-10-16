import {
  axisLabelFontSize,
  margin,
  title,
  titleFontSize,
  xAxisLabel,
  xAxisLabelOffset,
  yAxisLabelOffset,
} from './config';

export interface LabelsProps {
  width: number;
  height: number;
  measureLabel: string;
}

// Static text, so rendered as JSX rather than through a D3 data join. The
// y-axis label follows whichever measure is currently selected.
export function Labels({ width, height, measureLabel }: LabelsProps) {
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
        {measureLabel}
      </text>
    </g>
  );
}
