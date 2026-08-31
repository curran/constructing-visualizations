import { useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { csvParse } from 'd3-dsv';
import { useDimensions } from '../005-responsive-pseudo-scatter-plot/useDimensions';

interface Summary {
  rows: number;
  columns: number;
}

interface PenguinRow {
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

const FONT_SIZE = 28;
const LINE_HEIGHT = FONT_SIZE * 1.2;

export function LoadingAndSummarizingData() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const [data, setData] = useState<PenguinRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(DATA_URL)
      .then((response) => response.text())
      .then((text) => {
        if (cancelled) return;
        const parsed = csvParse(text);
        setData(
          parsed.map((row) => ({
            species: row.species,
            island: row.island,
            bill_length_mm: +row.bill_length_mm,
            bill_depth_mm: +row.bill_depth_mm,
            flipper_length_mm: +row.flipper_length_mm,
            body_mass_g: +row.body_mass_g,
            sex: row.sex,
            year: row.year,
          })),
        );
      })
      .catch((error) => {
        console.error('Failed to load data', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo<Summary | null>(() => {
    if (!data) return null;
    console.log(JSON.stringify(data, null, 2));
    return {
      rows: data.length,
      columns: Object.keys(data[0]).length,
    };
  }, [data]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0 || !summary) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    select(svg)
      .selectAll('text')
      .data([summary])
      .join('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', FONT_SIZE)
      .selectAll('tspan')
      .data((d) => [`Rows: ${d.rows}`, `Columns: ${d.columns}`])
      .join('tspan')
      .attr('x', centerX)
      .attr('dy', (_d, i) => (i === 0 ? 0 : LINE_HEIGHT))
      .text((d) => d);
  }, [dimensions, summary]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Summary of the Palmer Penguins dataset"
      ></svg>
    </div>
  );
}
