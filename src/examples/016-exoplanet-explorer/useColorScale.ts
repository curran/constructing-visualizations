import { useMemo } from 'react';
import { extent } from 'd3-array';
import { scaleOrdinal, scaleSequential } from 'd3-scale';
import type { ScaleOrdinal, ScaleSequential } from 'd3-scale';
import { interpolateBlues, schemeBlues } from 'd3-scale-chromatic';
import type { ColorColumn } from './config';
import type { ExoplanetRow } from './useExoplanetsDataset';

export type ColorScale =
  | { type: 'categorical'; scale: ScaleOrdinal<string, string>; domain: string[] }
  | { type: 'quantitative'; scale: ScaleSequential<string>; domain: [number, number] };

export function useColorScale(
  data: ExoplanetRow[] | null,
  colorColumn: ColorColumn,
): ColorScale | null {
  return useMemo(() => {
    if (!data) return null;

    if (colorColumn.type === 'categorical') {
      const domain = Array.from(new Set(data.map(colorColumn.accessor)));
      return {
        type: 'categorical',
        scale: scaleOrdinal<string, string>().domain(domain).range(schemeBlues[9]),
        domain,
      };
    }

    const [min, max] = extent(data, colorColumn.accessor);
    if (min === undefined || max === undefined) return null;

    const domain: [number, number] = min === max ? [min - 1, max + 1] : [min, max];
    return {
      type: 'quantitative',
      scale: scaleSequential(interpolateBlues).domain(domain),
      domain,
    };
  }, [data, colorColumn]);
}
