import { useCallback } from 'react';
import type { Measure } from './config';

export interface MeasureMenuProps {
  value: string;
  onChange: (key: string) => void;
  options: Measure[];
}

// A labelled select that chooses which aggregate the bar heights encode.
export function MeasureMenu({ value, onChange, options }: MeasureMenuProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value),
    [onChange],
  );

  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      Measure
      <select
        className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white"
        value={value}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
