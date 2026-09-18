Use the example creation skill to create a new example called Vanilla Tooltips, where it starts by copying Example 11, the tooltips example, but then removes the dependency on the third-party library, and we just do it all with vanilla React and D3, according to the following ideas:

If you already have tooltip state like `{ x, y, content }`, I think the cleanest architecture is:

**D3 figures out what is hovered and the anchor point. React renders one ordinary HTML tooltip into `document.body` using a portal.**

The key trick is `position: fixed`. If your `x` and `y` are viewport/screen coordinates, this completely sidesteps SVG/DOM coordinate-system headaches.

```jsx
import { createPortal } from 'react-dom';

export const Tooltip = ({ x, y, children }) => {
  if (x == null || y == null) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: 'translate(-50%, calc(-100% - 8px))',
        pointerEvents: 'none',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '6px 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}
    >
      {children}
    </div>,
    document.body,
  );
};
```

Then your visualization can be basically:

```jsx
const [tooltip, setTooltip] = useState(null);

// On hover:
setTooltip({
  x,
  y,
  datum: d,
});

// On mouse leave:
setTooltip(null);

return (
  <>
    <svg>{/* visualization */}</svg>

    {tooltip && (
      <Tooltip x={tooltip.x} y={tooltip.y}>
        <strong>{tooltip.datum.name}</strong>
        <div>{tooltip.datum.value}</div>
      </Tooltip>
    )}
  </>
);
```

### Why the portal is nice

Without a portal, you can absolutely put the `<div>` next to the `<svg>` and use `position: absolute`. But then you start caring about:

- which ancestor has `position: relative`
- SVG offsets
- scrolling
- clipping from `overflow: hidden`
- stacking contexts

Putting it in `document.body` means your mental model becomes simply:

```text
SVG mark
   ↓
viewport coordinate (x, y)
   ↓
position: fixed HTML tooltip
```

That's particularly clean for teaching React + D3 because **D3 doesn't need to own the tooltip DOM at all**.

### If your coordinates come from the pointer

It's even simpler:

```jsx
onPointerMove={(event) => {
  setTooltip({
    x: event.clientX,
    y: event.clientY,
    datum: d,
  });
}}
```

`clientX/clientY` are already viewport coordinates, exactly what a `position: fixed` element wants.

If instead you know the SVG-space coordinate, say:

```js
[x, y];
```

you can convert it to viewport coordinates:

```js
const point = svgRef.current.createSVGPoint();

point.x = x;
point.y = y;

const screenPoint = point.matrixTransform(svgRef.current.getScreenCTM());

setTooltip({
  x: screenPoint.x,
  y: screenPoint.y,
  datum: d,
});
```

But if your existing hover example **already knows the screen x/y**, I wouldn't add any more machinery.

I'd teach the pattern as:

> **React state holds `{x, y, datum}` → React Portal → fixed-position HTML tooltip.**

It's probably the smallest robust tooltip abstraction I've seen for React + D3.
