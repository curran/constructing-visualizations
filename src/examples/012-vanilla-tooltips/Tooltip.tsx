import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  // Viewport (screen) coordinates of the point the tooltip is anchored to.
  // These are exactly what `position: fixed` expects, so no SVG or DOM
  // coordinate-system math is needed here.
  x: number;
  y: number;
  children: ReactNode;
}

// A tooltip rendered into `document.body` through a React portal, positioned
// with `position: fixed` in viewport coordinates. Portalling it out of the
// visualization means no ancestor's `position`, `overflow: hidden`, or
// stacking context can clip or displace it.
export function Tooltip({ x, y, children }: TooltipProps) {
  return createPortal(
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        // Center horizontally on the anchor point and sit just above it.
        transform: 'translate(-50%, calc(-100% - 8px))',
        // Let pointer events fall through to the Voronoi overlay underneath.
        pointerEvents: 'none',
      }}
      className="z-50 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg"
    >
      {children}
    </div>,
    document.body,
  );
}
