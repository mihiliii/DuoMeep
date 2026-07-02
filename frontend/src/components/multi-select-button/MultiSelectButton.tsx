import './MultiSelectButton.css';
import { useEffect, useRef, useState } from 'react';

interface MultiSelectButtonProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function MultiSelectButton({ label, options, selected, onChange }: MultiSelectButtonProps) {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleClickOutside(event: MouseEvent): void {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }

  function toggleOption(option: string): void {
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
    <div className="filter-dropdown" ref={containerRef}>
      <button type="button" className="filter-toggle" onClick={(): void => setOpen((prev) => !prev)}>
        <span className="filter-label">{label}</span>
        <span className="filter-summary">
          {selected.length === 0 ? `All ${label.toLowerCase()}s` : selected.join(', ')}
        </span>
      </button>
      {open && (
        <div className="filter-menu">
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
