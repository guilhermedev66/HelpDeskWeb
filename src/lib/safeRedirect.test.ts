import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './safeRedirect';

describe('safeRedirectPath', () => {
  it('aceita uma rota interna válida', () => {
    expect(safeRedirectPath('/tickets/42')).toBe('/tickets/42');
  });

  it('rejeita URL absoluta com protocolo e origem externa', () => {
    expect(safeRedirectPath('https://evil.com/phishing')).toBe('/');
  });

  it('rejeita valor começando com "//" (protocol-relative)', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/');
  });

  it('rejeita o truque de barra invertida "/\\"', () => {
    expect(safeRedirectPath('/\\evil.com')).toBe('/');
  });

  it('cai em "/" quando o valor está ausente', () => {
    expect(safeRedirectPath(null)).toBe('/');
    expect(safeRedirectPath(undefined)).toBe('/');
    expect(safeRedirectPath('')).toBe('/');
  });
});
