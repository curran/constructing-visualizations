import {
  axisLabelFontSize,
  barChartTitle,
  margin,
  titleFontSize,
  xAxisLabelOffset,
  yAxisLabelOffset,
} from './config';

export interface BarChartLabelsProps {
  width: number;
  height: number;
  yLabel: string;
}

// Static text, so rendered as JSX rather than through a D3 data join. The
// y-axis label follows whichever measure is currently selected.
export function BarChartLabels({ width, height, yLabel }: BarChartLabelsProps) {
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
        {barChartTitle}
      </text>
      <text
        className="x-axis-label"
        x={plotCenterX}
        y={height - margin.bottom + xAxisLabelOffset}
        textAnchor="middle"
        fontSize={axisLabelFontSize}
      >
        Species
      </text>
      <text
        className="y-axis-label"
        transform={`translate(${margin.left - yAxisLabelOffset}, ${plotCenterY}) rotate(-90)`}
        textAnchor="middle"
        fontSize={axisLabelFontSize}
      >
        {yLabel}
      </text>
    </g>
  );
}
