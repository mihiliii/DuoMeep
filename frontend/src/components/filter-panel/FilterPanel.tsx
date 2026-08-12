import './FilterPanel.css';

import { Fragment } from 'react';

import MultiSelectButton from '@/components/multi-select-button/MultiSelectButton';

export type FilterValues = Record<string, string | string[]>;

type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];
type ListKeys<T> = { [K in keyof T]: T[K] extends string[] ? K : never }[keyof T];

export type FilterField<T> =
  | { kind: 'search'; key: StringKeys<T>; label: string; maxLength?: number }
  | { kind: 'multiSelect'; key: ListKeys<T>; label: string; options: readonly string[]; placeholder?: string }
  | { kind: 'dateRange'; fromKey: StringKeys<T>; toKey: StringKeys<T>; fromLabel: string; toLabel: string };

export type FilterPanelProps<T extends FilterValues> = {
  className: string;
  fields: FilterField<T>[];
  values: T;
  onChange: (values: T) => void;
  submitLabel: string;
  onSubmit: () => void;
};

export default function FilterPanel<T extends FilterValues>({
  className,
  fields,
  values,
  onChange,
  submitLabel,
  onSubmit,
}: FilterPanelProps<T>) {
  function patch(key: keyof T, value: string | string[]): void {
    onChange({ ...values, [key]: value } as T);
  }

  function text(key: keyof T): string {
    const value: string | string[] = values[key];
    return typeof value === 'string' ? value : '';
  }

  function list(key: keyof T): string[] {
    const value: string | string[] = values[key];
    return Array.isArray(value) ? value : [];
  }

  return (
    <div className={className}>
      <h2 className="filter-panel-label">Filters</h2>
      {fields.map((field) => {
        if (field.kind === 'search') {
          return (
            <label className="filter-field stack" key={String(field.key)}>
              <span className="field-label">{field.label}</span>
              <input
                type="search"
                className="filter-search"
                placeholder="Search"
                maxLength={field.maxLength}
                value={text(field.key)}
                onChange={(event) => patch(field.key, event.target.value)}
              />
            </label>
          );
        }

        if (field.kind === 'multiSelect') {
          return (
            <MultiSelectButton
              key={String(field.key)}
              label={field.label}
              options={field.options}
              selected={list(field.key)}
              onChange={(selected) => patch(field.key, selected)}
              placeholder={field.placeholder}
            />
          );
        }

        return (
          <Fragment key={String(field.fromKey)}>
            <label className="filter-field stack">
              <span className="field-label">{field.fromLabel}</span>
              <input
                type="date"
                className="filter-date-input"
                value={text(field.fromKey)}
                max={text(field.toKey) || undefined}
                onChange={(event) => patch(field.fromKey, event.target.value)}
              />
            </label>
            <label className="filter-field stack">
              <span className="field-label">{field.toLabel}</span>
              <input
                type="date"
                className="filter-date-input"
                value={text(field.toKey)}
                min={text(field.fromKey) || undefined}
                onChange={(event) => patch(field.toKey, event.target.value)}
              />
            </label>
          </Fragment>
        );
      })}
      <button type="button" className="filter-apply" onClick={onSubmit}>
        {submitLabel}
      </button>
    </div>
  );
}
