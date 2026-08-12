import './MultiSelectButton.css';

import { useEffect, useRef, useState } from 'react';

type MultiSelectButtonProps<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (next: T[]) => void;
  placeholder?: string;
}

export default function MultiSelectButton<T extends string>({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: MultiSelectButtonProps<T>) {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleClickOutside(event: MouseEvent): void {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }

  function toggleOption(option: T): void {
    if (selected.includes(option)) {
      onChange(selected.filter((value) => value !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  useEffect(() => {
    if (!open) return;

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="filter-dropdown stack" ref={containerRef}>
      <span className="field-label">{label}</span>
      <button type="button" className="filter-toggle" onClick={(): void => setOpen((prev) => !prev)}>
        <span className="filter-summary ellipsis">
          {selected.length === 0 ? (placeholder ?? `All ${label.toLowerCase()}s`) : selected.join(', ')}
        </span>
      </button>
      {open && (
        <div className="filter-menu popover">
          {options.map((option) => (
            <label key={option} className="filter-option">
              <input type="checkbox" checked={selected.includes(option)} onChange={(): void => toggleOption(option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
