import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

describe('AuthenticatedLayout — acessibilidade', () => {
  it('tem um skip link que aponta pro conteúdo principal', async () => {
    seedValidSession();
    renderApp(['/tickets']);

    const skipLink = await screen.findByRole('link', { name: 'Pular para o conteúdo principal' });
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('move o foco pro conteúdo principal ao trocar de rota', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/tickets']);

    await screen.findByRole('heading', { name: 'Fila de chamados' });
    await user.click(screen.getByRole('link', { name: 'Novo chamado' }));

    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveFocus();
    });
  });
});
