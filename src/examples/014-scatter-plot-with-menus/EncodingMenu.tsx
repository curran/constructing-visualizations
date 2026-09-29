import type { NumericColumn } from './config';

export interface EncodingMenuProps {
  label: string;
  value: string;
  onChange: (key: string) => void;
  options: NumericColumn[];
}

// A labelled select that chooses which numeric column feeds one axis.
export function EncodingMenu({ label, value, onChange, options }: EncodingMenuProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      {label}
      <select
        className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
