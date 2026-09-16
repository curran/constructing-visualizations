import { useMemo, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { flip, offset, shift, useFloating } from '@floating-ui/react-dom';

export interface TooltipProps {
  // The element that establishes the local coordinate system. `x` and `y` are
  // measured from the top-left corner of this element.
  anchorRef: RefObject<HTMLElement | null>;
  x: number;
  y: number;
  children: ReactNode;
}

// A tooltip positioned at an arbitrary point. `x` and `y` are visualization
// local coordinates; the component owns everything from that point outward:
// converting to viewport coordinates, keeping the tooltip inside the viewport,
// and portalling it to the body so ancestors cannot clip it.
export function Tooltip({ anchorRef, x, y, children }: TooltipProps) {
  // Floating UI positions against a "virtual element" (any object with a
  // getBoundingClientRect method) instead of a real DOM node. Our anchor is a
  // single point, so we expose a zero-size rectangle at that point. The point
  // arrives in visualization-local coordinates, so we add the container's
  // viewport offset to get the viewport coordinates that `fixed` expects.
  const virtualReference = useMemo(
    () => ({
      getBoundingClientRect() {
        const rect = anchorRef.current?.getBoundingClientRect();
        const left = (rect?.left ?? 0) + x;
        const top = (rect?.top ?? 0) + y;
        return {
          x: left,
          y: top,
          top,
          bottom: top,
          left,
          right: left,
          width: 0,
          height: 0,
        };
      },
    }),
    [anchorRef, x, y],
  );

  const {
    refs: { setFloating },
    floatingStyles,
  } = useFloating({
    // `fixed` positioning uses viewport coordinates, which is what the virtual
    // element above produces.
    strategy: 'fixed',
    placement: 'top',
    middleware: [
      // Leave a small gap between the point and the tooltip.
      offset(8),
      // Flip to the bottom when there is not enough room above.
      flip(),
      // Nudge the tooltip back inside the viewport near the edges.
      shift({ padding: 8 }),
    ],
    elements: { reference: virtualReference },
  });

  // Rendering through a portal keeps the tooltip out of the SVG and away from
  // any `overflow: hidden` or stacking context in the visualization.
  return createPortal(
    <div
      ref={setFloating}
      style={floatingStyles}
      role="tooltip"
      // `pointer-events: none` lets the Voronoi overlay keep receiving hover
      // events even when the tooltip visually covers it.
      className="pointer-events-none z-50 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg"
    >
      {children}
    </div>,
    document.body,
  );
}
