import { Tooltip } from './Tooltip';
import { useInteraction } from './InteractionContext';
import type { PenguinRow } from './usePenguinsDataset';

const numberFormat = new Intl.NumberFormat('en-US');

export interface TooltipLayerProps {
  data: PenguinRow[];
}

// Derives the hovered row from the tooltip state (which stores its index) and
// renders the tooltip contents. Everything it shows comes from context except
// the rows themselves.
export function TooltipLayer({ data }: TooltipLayerProps) {
  const { tooltip } = useInteraction();
  const row = tooltip ? (data[tooltip.index] ?? null) : null;

  if (!tooltip || !row) return null;

  return (
    <Tooltip x={tooltip.x} y={tooltip.y}>
      <div className="font-medium">{row.species}</div>
      <div>Bill length: {row.bill_length_mm} mm</div>
      <div>Bill depth: {row.bill_depth_mm} mm</div>
      {Number.isFinite(row.flipper_length_mm) && (
        <div>Flipper length: {row.flipper_length_mm} mm</div>
      )}
      {Number.isFinite(row.body_mass_g) && (
        <div>Body mass: {numberFormat.format(row.body_mass_g)} g</div>
      )}
    </Tooltip>
  );
}
