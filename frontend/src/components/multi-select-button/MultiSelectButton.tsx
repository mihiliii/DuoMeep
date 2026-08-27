import './MultiSelectButton.css';

import { useEffect, useRef, useState } from 'react';

type MultiSelectButtonProps<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (next: T[]) => void;
  placeholder?: string;
  single?: boolean;
  iconSrc?: (option: T) => string;
};

export default function MultiSelectButton<T extends string>({
  label,
  options,
  selected,
  onChange,
  placeholder,
  single,
  iconSrc,
}: MultiSelectButtonProps<T>) {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleClickOutside(event: MouseEvent): void {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }

  function toggleOption(option: T): void {
    if (single) {
      onChange([option]);
      setOpen(false);
      return;
    }

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
        {iconSrc && selected.length === 1 && <img className="filter-option-icon" src={iconSrc(selected[0])} alt="" />}
        <span className="filter-summary ellipsis">
          {selected.length === 0 ? (placeholder ?? `All ${label.toLowerCase()}s`) : selected.join(', ')}
        </span>
      </button>
      {open && (
        <div className="filter-menu popover">
          {options.map((option) => (
            <label key={option} className="filter-option">
              <input
                type={single ? 'radio' : 'checkbox'}
                name={single ? label : undefined}
                checked={selected.includes(option)}
                onChange={(): void => toggleOption(option)}
              />
              {iconSrc && <img className="filter-option-icon" src={iconSrc(option)} alt="" />}
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
