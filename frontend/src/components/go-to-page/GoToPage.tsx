import { useState } from 'react';

type GoToPageProps = {
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function GoToPage({ totalPages, onPageChange }: GoToPageProps) {
  const [value, setValue] = useState<string>('');

  const page: number = Number(value);
  const isValid: boolean = value !== '' && Number.isInteger(page) && page >= 1 && page <= totalPages;

  if (totalPages <= 1) {
    return null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    onPageChange(page);
    setValue('');
  }

  return (
    <form className="go-to-page center" onSubmit={handleSubmit}>
      <input
        className="go-to-page-input"
        type="text"
        inputMode="numeric"
        maxLength={String(totalPages).length}
        placeholder={`1-${totalPages}`}
        aria-label="Go to page"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
      />
      <button type="submit" className="go-to-page-btn" disabled={!isValid}>
        Go
      </button>
    </form>
  );
}
