import { Tooltip } from './Tooltip';
import { useInteraction } from './InteractionContext';
import type { ExoplanetRow } from './useExoplanetsDataset';

const numberFormat = new Intl.NumberFormat('en-US');

export interface TooltipLayerProps {
  data: ExoplanetRow[];
}

export function TooltipLayer({ data }: TooltipLayerProps) {
  const { tooltip } = useInteraction();
  const row = tooltip ? (data[tooltip.index] ?? null) : null;

  if (!tooltip || !row) return null;

  return (
    <Tooltip x={tooltip.x} y={tooltip.y}>
      <div className="font-medium">{row.pl_name}</div>
      <div>Host star: {row.hostname}</div>
      <div>Discovery method: {row.discoverymethod}</div>
      {Number.isFinite(row.disc_year) && <div>Discovery year: {row.disc_year}</div>}
      <div>Planet type: {row.planet_type}</div>
      {Number.isFinite(row.pl_rade) && (
        <div>Planet radius: {numberFormat.format(row.pl_rade)} Earth radii</div>
      )}
      {Number.isFinite(row.pl_bmasse) && (
        <div>Planet mass: {numberFormat.format(row.pl_bmasse)} Earth masses</div>
      )}
      {Number.isFinite(row.pl_orbper) && (
        <div>Orbital period: {numberFormat.format(row.pl_orbper)} days</div>
      )}
      {Number.isFinite(row.st_teff) && (
        <div>Stellar temperature: {numberFormat.format(row.st_teff)} K</div>
      )}
    </Tooltip>
  );
}
