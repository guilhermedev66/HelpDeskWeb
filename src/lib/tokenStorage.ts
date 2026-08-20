/**
 * Ponto único de leitura/escrita do JWT.
 *
 * Estratégia: localStorage. Escolhida pelo MVP por simplicidade — o
 * back-end não expõe cookie HttpOnly (ver C:\dev\HelpDeskAPI), então
 * não há como o front-end evitar sozinho o risco de um XSS ler o token.
 * localStorage e cookie não-HttpOnly têm o mesmo risco residual nesse
 * cenário; centralizar o acesso aqui pelo menos garante que o token
 * nunca é lido/escrito em mais de um lugar, e nunca vai para console,
 * DOM ou mensagens de erro.
 */
const TOKEN_KEY = 'helpdesk.accessToken';
const EXPIRES_AT_KEY = 'helpdesk.expiresAt';

export interface StoredSession {
  accessToken: string;
  expiresAt: string;
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(EXPIRES_AT_KEY, session.expiresAt);
}

export function readSession(): StoredSession | null {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!accessToken || !expiresAt) return null;
  return { accessToken, expiresAt };
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}
