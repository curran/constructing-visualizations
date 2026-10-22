import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import type { ScaleLinear } from 'd3-scale';
import { renderBrushOverlay } from './renderBrushOverlay';
import type { DomainRect } from './config';

export interface BrushOverlayProps {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  width: number;
  height: number;
  range: DomainRect | null;
  onBrush: (rect: DomainRect | null) => void;
}

// React owns this container group; D3 attaches the brush behavior that draws
// the draggable selection rectangle inside it. This overlay sits on top of the
// marks and captures the pointer so dragging selects a region.
export function BrushOverlay({ xScale, yScale, width, height, range, onBrush }: BrushOverlayProps) {
  const groupRef = useRef<SVGGElement>(null);

  // The selection is read through a ref so that changing it does not re-run the
  // effect below. Re-initializing the brush on every selection change would
  // re-project the last committed rectangle in the middle of a drag and fight
  // the gesture.
  const rangeRef = useRef(range);
  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  // Re-runs only when the scales change — a resize or a new encoding — which is
  // exactly when the previous rectangle has to be re-projected.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    renderBrushOverlay(select(group), {
      xScale,
      yScale,
      width,
      height,
      range: rangeRef.current,
      onBrush,
    });
  }, [xScale, yScale, width, height, onBrush]);

  return <g ref={groupRef} className="brush-overlay" />;
}
