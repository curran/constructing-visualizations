import { useCallback } from 'react';
export interface EncodingMenuProps {
  label: string;
  value: string;
  onChange: (key: string) => void;
  options: { key: string; label: string }[];
}

// A labelled select that chooses which data column feeds an encoding.
export function EncodingMenu({ label, value, onChange, options }: EncodingMenuProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value),
    [onChange],
  );

  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      {label}
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
