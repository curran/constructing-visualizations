import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';

export interface ExoplanetRow {
  pl_name: string;
  hostname: string;
  discoverymethod: string;
  disc_year: number;
  pl_rade: number;
  pl_bmasse: number;
  pl_orbper: number;
  st_teff: number;
  ra: number;
  dec: number;
  planet_type: string;
}

const DATA_URL = `${import.meta.env.BASE_URL}datasets/nasa-exoplanets/nasa_exoplanets.csv`;

const numericColumns = [
  'disc_year',
  'pl_rade',
  'pl_bmasse',
  'pl_orbper',
  'st_teff',
  'ra',
  'dec',
] as const;

export function useExoplanetsDataset() {
  const [data, setData] = useState<ExoplanetRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    csv<ExoplanetRow>(DATA_URL, (rawRow) => {
      const row = rawRow as unknown as ExoplanetRow;
      for (const column of numericColumns) {
        row[column] = row[column] === '' ? Number.NaN : Number(row[column]);
      }
      if (!row.planet_type) row.planet_type = 'Unknown';
      if (!row.discoverymethod) row.discoverymethod = 'Unknown';
      return row;
    })
      .then((rows) => {
        if (cancelled) return;
        setData(rows);
      })
      .catch((error) => {
        console.error('Failed to load data', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
