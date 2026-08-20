/**
 * Restringe o destino de `?redirect=` a uma rota interna, evitando open redirect.
 * Regras: precisa começar com "/", não pode começar com "//" (protocol-relative)
 * nem com "/\" (mesmo truque, alguns navegadores normalizam "\" para "/"). Qualquer
 * valor ausente ou fora dessas regras cai em "/".
 */
export function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return '/';
  if (!value.startsWith('/')) return '/';
  if (value.startsWith('//') || value.startsWith('/\\')) return '/';
  return value;
}
