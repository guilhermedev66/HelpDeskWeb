import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';
import { ADMIN_USER, PLAIN_USER, server } from '../../test/server';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

function asUser(user: typeof ADMIN_USER | typeof PLAIN_USER) {
  server.use(http.get('/api/auth/me', () => HttpResponse.json(user)));
}

describe('CategoriesAdminPage — acesso', () => {
  it('bloqueia quem não é Admin com uma mensagem, sem quebrar a navegação', async () => {
    asUser(PLAIN_USER);
    seedValidSession();
    renderApp(['/admin/categories']);

    expect(await screen.findByText('Você não tem permissão para acessar esta página.')).toBeInTheDocument();
  });
});

describe('CategoriesAdminPage — Admin', () => {
  it('lista categorias ativas e inativas', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    renderApp(['/admin/categories']);

    expect(await screen.findByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('Impressoras (legado)')).toBeInTheDocument();
    expect(screen.getAllByText('Ativa').length).toBeGreaterThan(0);
    expect(screen.getByText('Inativa')).toBeInTheDocument();
  });

  it('cria uma categoria nova', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/admin/categories']);

    await screen.findByText('Hardware');
    await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await user.type(screen.getByLabelText('Nome da categoria'), 'Telefonia');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Telefonia')).toBeInTheDocument();
  });

  it('mostra conflito 409 ao criar categoria com nome duplicado', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/admin/categories']);

    await screen.findByText('Hardware');
    await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await user.type(screen.getByLabelText('Nome da categoria'), 'Hardware');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('A category with this name already exists.')).toBeInTheDocument();
  });

  it('renomeia uma categoria', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/admin/categories']);

    await screen.findByText('Rede');
    const renameButtons = screen.getAllByRole('button', { name: 'Renomear' });
    await user.click(renameButtons[1]);

    const input = screen.getByLabelText('Novo nome para Rede');
    await user.clear(input);
    await user.type(input, 'Infraestrutura de Rede');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Infraestrutura de Rede')).toBeInTheDocument();
  });

  it('desativa uma categoria após confirmação', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/admin/categories']);

    await screen.findByText('Hardware');
    const deactivateButtons = screen.getAllByRole('button', { name: 'Desativar' });
    await user.click(deactivateButtons[0]);

    expect(screen.getByText('Desativar?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sim' }));

    await waitFor(() => {
      expect(screen.getAllByText('Inativa').length).toBe(2);
    });
  });

  it('reativa uma categoria inativa sem exigir confirmação', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/admin/categories']);

    await screen.findByText('Impressoras (legado)');
    await user.click(screen.getByRole('button', { name: 'Ativar' }));

    await waitFor(() => {
      expect(screen.getAllByText('Ativa').length).toBe(4);
    });
  });

  it('mostra estado vazio quando não há categorias', async () => {
    asUser(ADMIN_USER);
    server.use(http.get('/api/categories/all', () => HttpResponse.json([])));
    seedValidSession();
    renderApp(['/admin/categories']);

    expect(await screen.findByText('Nenhuma categoria cadastrada')).toBeInTheDocument();
  });

  it('mostra erro com retry quando a listagem falha', async () => {
    asUser(ADMIN_USER);
    server.use(http.get('/api/categories/all', () => HttpResponse.error()));
    seedValidSession();

    const user = userEvent.setup();
    renderApp(['/admin/categories']);

    expect(
      await screen.findByText('Não foi possível carregar as categorias. Tente novamente.'),
    ).toBeInTheDocument();

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Hardware')).toBeInTheDocument();
  });
});
