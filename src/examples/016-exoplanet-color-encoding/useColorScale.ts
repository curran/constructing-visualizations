import { useMemo } from 'react';
import { scaleOrdinal, scaleSequential } from 'd3-scale';
import type { ScaleOrdinal, ScaleSequential } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';
import { extent } from 'd3-array';
import type { ColorColumn } from './config';
import type { ExoplanetRow } from './useExoplanetsDataset';
import { colorRange } from './config';

export type ColorScale = ScaleOrdinal<string, string> | ScaleSequential<string>;

export function useColorScale(
  data: ExoplanetRow[] | null,
  colorColumn: ColorColumn,
): ColorScale | null {
  return useMemo(() => {
    if (!data) return null;

    if (colorColumn.type === 'categorical') {
      const domain = Array.from(new Set(data.map(colorColumn.accessor)));
      return scaleOrdinal<string, string>().domain(domain).range(colorRange);
    }

    const values = data.map(colorColumn.accessor).filter(Number.isFinite);
    if (values.length === 0) return null;

    const [minimum, maximum] = extent(values) as [number, number];
    const domain: [number, number] =
      minimum === maximum ? [minimum - 1, maximum + 1] : [minimum, maximum];
    return scaleSequential<string>(interpolateBlues).domain(domain);
  }, [data, colorColumn]);
}
