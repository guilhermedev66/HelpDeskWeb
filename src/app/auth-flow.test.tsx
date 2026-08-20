import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';
import { server, AUTH_USER } from '../test/server';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

describe('proteção de rota e sessão', () => {
  it('redireciona para /login preservando o destino quando não autenticado', async () => {
    renderApp(['/']);

    expect(await screen.findByText('Help Desk')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('restaura a sessão via GET /api/auth/me quando há token salvo', async () => {
    seedValidSession();
    renderApp(['/']);

    expect(await screen.findByText('Novo chamado')).toBeInTheDocument();
    expect(screen.getByText(AUTH_USER.displayName)).toBeInTheDocument();
  });

  it('limpa a sessão e volta para /login quando /me responde 401', async () => {
    localStorage.setItem('helpdesk.accessToken', 'token-expirado');
    localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());

    renderApp(['/']);

    expect(await screen.findByText('Help Desk')).toBeInTheDocument();
    expect(localStorage.getItem('helpdesk.accessToken')).toBeNull();
  });

  it('desloga localmente e volta para a tela de login', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/']);

    await screen.findByText('Novo chamado');
    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByText('Help Desk')).toBeInTheDocument();
    expect(localStorage.getItem('helpdesk.accessToken')).toBeNull();
  });

  it('preserva o token quando /me falha por erro de rede (não trata como deslogado)', async () => {
    seedValidSession();
    server.use(http.get('/api/auth/me', () => HttpResponse.error()));

    renderApp(['/']);

    expect(await screen.findByText(/Não foi possível validar sua sessão/)).toBeInTheDocument();
    expect(localStorage.getItem('helpdesk.accessToken')).toBe('fake-jwt-token');
  });

  it('preserva o token quando /me responde 5xx', async () => {
    seedValidSession();
    server.use(
      http.get('/api/auth/me', () =>
        HttpResponse.json({ status: 500, title: 'Internal Server Error' }, { status: 500 }),
      ),
    );

    renderApp(['/']);

    expect(await screen.findByText(/Não foi possível validar sua sessão/)).toBeInTheDocument();
    expect(localStorage.getItem('helpdesk.accessToken')).toBe('fake-jwt-token');
  });

  it('restaura a sessão ao tentar novamente após a rede voltar', async () => {
    seedValidSession();
    server.use(http.get('/api/auth/me', () => HttpResponse.error()));

    const user = userEvent.setup();
    renderApp(['/']);
    await screen.findByText(/Não foi possível validar sua sessão/);

    server.use(http.get('/api/auth/me', () => HttpResponse.json(AUTH_USER)));
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Novo chamado')).toBeInTheDocument();
    expect(localStorage.getItem('helpdesk.accessToken')).toBe('fake-jwt-token');
  });

  it('encerra a sessão automaticamente quando uma chamada autenticada recebe 401', async () => {
    seedValidSession();
    server.use(
      http.get('/api/tickets', () =>
        HttpResponse.json({ status: 401, title: 'Unauthorized' }, { status: 401 }),
      ),
    );

    renderApp(['/']);

    expect(await screen.findByLabelText('E-mail')).toBeInTheDocument();
    expect(localStorage.getItem('helpdesk.accessToken')).toBeNull();
  });
});
