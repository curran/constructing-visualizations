import { useCallback } from 'react';
import { maxBinCount, minBinCount } from './config';

export interface BinCountSliderProps {
  value: number;
  onChange: (value: number) => void;
}

// A continuous control rather than a menu, so the effect of changing the bin
// count can be explored by dragging and watching the distribution reshuffle.
export function BinCountSlider({ value, onChange }: BinCountSliderProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value)),
    [onChange],
  );

  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      <span>Target bins: {value}</span>
      <input
        className="w-48 accent-blue-600"
        type="range"
        min={minBinCount}
        max={maxBinCount}
        step={1}
        value={value}
        onChange={handleChange}
      />
    </label>
  );
}
