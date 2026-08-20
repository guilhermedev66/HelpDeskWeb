import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';
import { server, CATEGORY_FIXTURES } from '../../test/server';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Título'), 'Impressora não liga');
  await user.type(screen.getByLabelText('Descrição'), 'A impressora do 3º andar não liga desde ontem.');
  await user.selectOptions(screen.getByLabelText('Categoria'), CATEGORY_FIXTURES[0].name);
}

describe('NewTicketPage', () => {
  it('lista somente categorias ativas retornadas por GET /api/categories', async () => {
    seedValidSession();
    renderApp(['/tickets/new']);

    const select = (await screen.findByLabelText('Categoria')) as HTMLSelectElement;
    await within(select).findByText(CATEGORY_FIXTURES[0].name);

    const optionLabels = [...select.options].map((option) => option.text);
    expect(optionLabels).toEqual(['Selecione uma categoria', ...CATEGORY_FIXTURES.map((c) => c.name)]);
  });

  it('valida campos obrigatórios', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/tickets/new']);

    await screen.findByLabelText('Categoria');
    await user.click(screen.getByRole('button', { name: 'Criar chamado' }));

    expect(await screen.findByText('Informe um título.')).toBeInTheDocument();
    expect(screen.getByText('Descreva o problema.')).toBeInTheDocument();
  });

  it('cria o chamado com sucesso e navega para os detalhes', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/tickets/new']);

    await screen.findByLabelText('Categoria');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar chamado' }));

    expect(await screen.findByRole('heading', { name: 'Impressora não liga' })).toBeInTheDocument();
  });

  it('mostra erro de regra de negócio (400 sem fieldErrors) como mensagem geral', async () => {
    seedValidSession();
    server.use(
      http.post('/api/tickets', () =>
        HttpResponse.json(
          { status: 400, title: 'Business rule validation failed.', detail: 'Category is not active.' },
          { status: 400 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderApp(['/tickets/new']);

    await screen.findByLabelText('Categoria');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar chamado' }));

    expect(await screen.findByText('Category is not active.')).toBeInTheDocument();
  });

  it('mostra toast em erro de rede', async () => {
    seedValidSession();
    server.use(http.post('/api/tickets', () => HttpResponse.error()));

    const user = userEvent.setup();
    renderApp(['/tickets/new']);

    await screen.findByLabelText('Categoria');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar chamado' }));

    expect(await screen.findByText(/Não foi possível conectar à API/)).toBeInTheDocument();
  });

  it('desabilita o botão de envio durante o submit (proteção contra envio duplo)', async () => {
    server.use(
      http.post('/api/tickets', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ id: 'x' }, { status: 201 });
      }),
    );
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/tickets/new']);

    await screen.findByLabelText('Categoria');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar chamado' }));

    expect(screen.getByRole('button', { name: 'Criar chamado' })).toBeDisabled();
  });

  it('cancelar volta para a listagem de chamados', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/tickets/new']);

    await screen.findByLabelText('Categoria');
    await user.click(screen.getByRole('link', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Fila de chamados' })).toBeInTheDocument();
    });
  });
});
