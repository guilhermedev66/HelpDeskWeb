import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';
import { server, EXISTING_EMAIL } from '../../test/server';

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{ name: string; email: string; password: string; confirmPassword: string }> = {},
) {
  const {
    name = 'Nova Pessoa',
    email = 'nova.pessoa@helpdesk.com',
    password = 'senhaComDozeCaracteres',
    confirmPassword = password,
  } = overrides;
  await user.type(screen.getByLabelText('Nome completo'), name);
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Senha'), password);
  await user.type(screen.getByLabelText('Confirmar senha'), confirmPassword);
}

describe('RegisterPage', () => {
  it('valida campos obrigatórios e senha curta', async () => {
    const user = userEvent.setup();
    renderApp(['/register']);

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Nome deve ter entre 2 e 120 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByText('Senha deve ter no mínimo 12 caracteres.')).toBeInTheDocument();
  });

  it('rejeita quando a confirmação de senha não bate', async () => {
    const user = userEvent.setup();
    renderApp(['/register']);

    await fillForm(user, { confirmPassword: 'outraSenhaDiferente' });
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('As senhas não coincidem.')).toBeInTheDocument();
  });

  it('cadastra com sucesso e navega autenticado', async () => {
    const user = userEvent.setup();
    renderApp(['/register']);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Bem-vindo(a) de volta.')).toBeInTheDocument();
    expect(localStorage.getItem('helpdesk.accessToken')).toBe('fake-jwt-token');
  });

  it('mostra erro de e-mail duplicado (400 ValidationProblemDetails)', async () => {
    const user = userEvent.setup();
    renderApp(['/register']);

    await fillForm(user, { email: EXISTING_EMAIL });
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText(/already taken/)).toBeInTheDocument();
  });

  it('mostra toast em erro de rede', async () => {
    server.use(http.post('/api/auth/register', () => HttpResponse.error()));
    const user = userEvent.setup();
    renderApp(['/register']);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText(/Não foi possível conectar à API/)).toBeInTheDocument();
  });
});
