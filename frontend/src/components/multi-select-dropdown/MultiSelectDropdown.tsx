import { useEffect, useRef, useState, type ReactElement } from 'react';
import './MultiSelectDropdown.css';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const toggleOption = (option: string): void => {
    if (selected.includes(option)) {
      onChange(selected.filter((value: string) => value !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="filter-dropdown" ref={containerRef}>
      <button type="button" className="filter-toggle" onClick={(): void => setOpen((prev: boolean) => !prev)}>
        <span className="filter-label">{label}</span>
        <span className="filter-summary">
          {selected.length === 0 ? `All ${label.toLowerCase()}s` : selected.join(', ')}
        </span>
      </button>
      {open && (
        <div className="filter-menu">
          {options.map((option: string) => (
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
