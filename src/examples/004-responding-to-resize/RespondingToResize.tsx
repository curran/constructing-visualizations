import { useEffect, useRef, useState } from 'react';

export function RespondingToResize() {
  const divRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });

    observer.observe(div);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg className="absolute inset-0 w-full h-full">
        <line x1={0} y1={height} x2={width} y2={0} stroke="black" strokeWidth={30} opacity={0.5} />
        <line x1={0} y1={0} x2={width} y2={height} stroke="black" strokeWidth={30} opacity={0.5} />
      </svg>
    </div>
  );
}
