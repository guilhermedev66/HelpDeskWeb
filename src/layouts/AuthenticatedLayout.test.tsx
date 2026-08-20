import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';
import { ADMIN_USER, PLAIN_USER, server } from '../test/server';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

function asUser(user: typeof ADMIN_USER | typeof PLAIN_USER) {
  server.use(http.get('/api/auth/me', () => HttpResponse.json(user)));
}

describe('AuthenticatedLayout — navegação por perfil', () => {
  it('Admin vê o link Categorias na navegação', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    renderApp(['/tickets']);

    await screen.findByRole('heading', { name: 'Fila de chamados' });
    expect(screen.getAllByRole('link', { name: 'Categorias' }).length).toBeGreaterThan(0);
  });

  it('User não vê o link Categorias na navegação', async () => {
    asUser(PLAIN_USER);
    seedValidSession();
    renderApp(['/tickets']);

    await screen.findByRole('heading', { name: 'Meus chamados' });
    const navs = screen.getAllByRole('navigation', { name: 'Navegação principal' });
    for (const nav of navs) {
      expect(within(nav).queryByRole('link', { name: 'Categorias' })).not.toBeInTheDocument();
    }
  });

  it('mostra o nome do papel real do usuário (roles do back-end)', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    renderApp(['/tickets']);

    expect(await screen.findByText('Admin')).toBeInTheDocument();
  });
});
