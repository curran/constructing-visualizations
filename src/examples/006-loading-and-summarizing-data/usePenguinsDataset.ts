import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';

export interface PenguinRow {
  species: string;
  island: string;
  bill_length_mm: number;
  bill_depth_mm: number;
  flipper_length_mm: number;
  body_mass_g: number;
  sex: string;
  year: string;
}

const DATA_URL = `${import.meta.env.BASE_URL}datasets/palmer-penguins/penguins.csv`;

export function usePenguinsDataset() {
  const [data, setData] = useState<PenguinRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    csv<PenguinRow>(DATA_URL, (rawRow) => {
      // Mutate the row in place and return it, rather than minting new objects.
      const row = rawRow as unknown as PenguinRow;
      row.bill_length_mm = +row.bill_length_mm;
      row.bill_depth_mm = +row.bill_depth_mm;
      row.flipper_length_mm = +row.flipper_length_mm;
      row.body_mass_g = +row.body_mass_g;
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
