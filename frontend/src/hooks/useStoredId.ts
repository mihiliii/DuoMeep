import { useState } from 'react';

export function useStoredId(key: string): [string | null, (id: string | null) => void] {
  const [id, setId] = useState<string | null>(localStorage.getItem(key));

  function setStoredId(next: string | null): void {
    if (next) {
      localStorage.setItem(key, next);
    } else {
      localStorage.removeItem(key);
    }
    setId(next);
  }

  return [id, setStoredId];
}
