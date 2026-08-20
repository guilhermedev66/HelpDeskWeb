import { useEffect, useState } from 'react';

/**
 * Vira `true` só se `active` continuar verdadeiro por mais de `delayMs`.
 * Usado pra avisar sobre o cold start do plano gratuito do Render sem mostrar
 * esse aviso em toda requisição normal (que resolve bem antes do delay).
 */
export function useSlowRequestNotice(active: boolean, delayMs = 4000): boolean {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react/set-state-in-effect
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return isSlow;
}
