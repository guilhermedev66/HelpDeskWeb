import { useEffect, useState } from 'react';

/** Atrasa a propagação de `value` em `delayMs` — evita 1 requisição por tecla digitada. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
