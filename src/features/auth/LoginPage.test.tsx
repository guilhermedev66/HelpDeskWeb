import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';
import { server, VALID_CREDENTIALS } from '../../test/server';

describe('LoginPage', () => {
  it('mostra erros de validação ao enviar o formulário vazio', async () => {
    const user = userEvent.setup();
    renderApp(['/login']);

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
  });

  it('autentica com credenciais válidas e navega para a área autenticada', async () => {
    const user = userEvent.setup();
    renderApp(['/login']);

    await user.type(screen.getByLabelText('E-mail'), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText('Senha'), VALID_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Novo chamado')).toBeInTheDocument();
  });

  it('exibe mensagem da API para credenciais inválidas (401)', async () => {
    const user = userEvent.setup();
    renderApp(['/login']);

    await user.type(screen.getByLabelText('E-mail'), 'errado@helpdesk.com');
    await user.type(screen.getByLabelText('Senha'), 'senha-errada-123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });

  it('mostra estado de carregamento enquanto a requisição está em andamento', async () => {
    server.use(
      http.post('/api/auth/login', async () => {
        await delay(50);
        return HttpResponse.json({ status: 401, title: 'Invalid email or password.' }, { status: 401 });
      }),
    );

    const user = userEvent.setup();
    renderApp(['/login']);

    await user.type(screen.getByLabelText('E-mail'), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText('Senha'), VALID_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).not.toBeDisabled());
  });

  it('mostra toast quando a API está indisponível (erro de rede)', async () => {
    server.use(http.post('/api/auth/login', () => HttpResponse.error()));

    const user = userEvent.setup();
    renderApp(['/login']);

    await user.type(screen.getByLabelText('E-mail'), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText('Senha'), VALID_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText(/Não foi possível conectar à API/)).toBeInTheDocument();
  });
});
