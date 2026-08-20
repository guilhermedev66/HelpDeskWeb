/**
 * Canal mínimo para o httpClient avisar a AuthContext de uma sessão
 * inválida (401) sem import circular entre lib/ e features/auth/.
 */
type UnauthorizedListener = () => void;

const listeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitUnauthorized(): void {
  for (const listener of listeners) listener();
}
