import { useEffect, useRef, useState } from 'react';

export function useDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const div = ref.current;
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

  return { ref, dimensions };
}
