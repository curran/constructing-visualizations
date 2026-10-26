import { useCallback } from 'react';
import type { NumericAttribute } from './config';

export interface AttributeMenuProps {
  value: string;
  onChange: (key: string) => void;
  options: NumericAttribute[];
}

// A labelled select that chooses which quantitative column is binned.
export function AttributeMenu({ value, onChange, options }: AttributeMenuProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value),
    [onChange],
  );

  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      Attribute
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
