import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';
import { ADMIN_USER, PLAIN_USER, server, TICKET_FIXTURES } from '../../test/server';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

const ASSIGNED_TO_AGENT = TICKET_FIXTURES[0].id; // atribuído a AUTH_USER (Agent)
const UNASSIGNED = TICKET_FIXTURES[1].id;
const ASSIGNED_TO_OTHER_AGENT = TICKET_FIXTURES[3].id;

function asUser(user: typeof ADMIN_USER | typeof PLAIN_USER) {
  server.use(http.get('/api/auth/me', () => HttpResponse.json(user)));
}

describe('WorkflowActions — permissões por role', () => {
  it('User não vê a seção de ações operacionais', async () => {
    asUser(PLAIN_USER);
    seedValidSession();
    renderApp([`/tickets/${ASSIGNED_TO_AGENT}`]);

    await screen.findByRole('heading', { name: TICKET_FIXTURES[0].title });
    expect(screen.queryByRole('heading', { name: 'Ações do agente' })).not.toBeInTheDocument();
  });

  it('Agent vê "Assumir chamado" quando o chamado está sem responsável', async () => {
    seedValidSession();
    renderApp([`/tickets/${UNASSIGNED}`]);

    expect(await screen.findByRole('button', { name: 'Assumir chamado' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });

  it('Agent vê controles de status/prioridade quando está atribuído ao chamado', async () => {
    seedValidSession();
    renderApp([`/tickets/${ASSIGNED_TO_AGENT}`]);

    expect(await screen.findByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Prioridade')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assumir chamado' })).not.toBeInTheDocument();
  });

  it('Agent sem atribuição a um chamado de outro agente só vê o aviso', async () => {
    seedValidSession();
    renderApp([`/tickets/${ASSIGNED_TO_OTHER_AGENT}`]);

    expect(
      await screen.findByText('Assuma o chamado para gerenciar status e prioridade.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assumir chamado' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });

  it('Admin gerencia e assume qualquer chamado, mesmo não atribuído a ele', async () => {
    asUser(ADMIN_USER);
    seedValidSession();
    renderApp([`/tickets/${ASSIGNED_TO_OTHER_AGENT}`]);

    expect(await screen.findByRole('button', { name: 'Assumir chamado' })).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Prioridade')).toBeInTheDocument();
  });
});

describe('WorkflowActions — assumir, status e prioridade', () => {
  it('assume o chamado e atualiza a exibição', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp([`/tickets/${UNASSIGNED}`]);

    await user.click(await screen.findByRole('button', { name: 'Assumir chamado' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Assumir chamado' })).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('altera a prioridade com sucesso', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp([`/tickets/${ASSIGNED_TO_AGENT}`]);

    await user.selectOptions(await screen.findByLabelText('Prioridade'), 'Crítica');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    });
  });

  it('pede confirmação antes de fechar o chamado', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp([`/tickets/${ASSIGNED_TO_AGENT}`]);

    // InProgress -> Resolved -> (depois) Closed é a transição real; aqui simulamos
    // um chamado já Resolved pra testar diretamente a transição para Closed.
    server.use(
      http.get('/api/tickets/:ticketId', () =>
        HttpResponse.json({
          ...TICKET_FIXTURES[0],
          description: 'Descrição',
          status: 'Resolved',
          firstRespondedAt: '2026-08-18T10:00:00.000Z',
          resolvedAt: '2026-08-18T15:00:00.000Z',
          closedAt: null,
        }),
      ),
    );

    await user.selectOptions(await screen.findByLabelText('Status'), 'Fechado');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByText(/Fechar o chamado é definitivo — não é possível reabrir depois\. Confirma\?/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar fechamento' })).toBeInTheDocument();
  });

  it('mostra aviso de conflito (409) e permite recarregar, sem repetir a mutação sozinha', async () => {
    seedValidSession();
    server.use(
      http.patch('/api/tickets/:ticketId/priority', () =>
        HttpResponse.json({ status: 409, title: 'Conflict.' }, { status: 409 }),
      ),
    );

    const user = userEvent.setup();
    renderApp([`/tickets/${ASSIGNED_TO_AGENT}`]);

    await user.selectOptions(await screen.findByLabelText('Prioridade'), 'Crítica');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByText(
        'Este chamado foi alterado por outra pessoa. Recarregue para ver os dados mais recentes.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
  });

  it('mostra mensagem de permissão negada (403)', async () => {
    seedValidSession();
    server.use(
      http.patch('/api/tickets/:ticketId/priority', () =>
        HttpResponse.json({ status: 403, title: 'This operation is not allowed.' }, { status: 403 }),
      ),
    );

    const user = userEvent.setup();
    renderApp([`/tickets/${ASSIGNED_TO_AGENT}`]);

    await user.selectOptions(await screen.findByLabelText('Prioridade'), 'Crítica');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('This operation is not allowed.')).toBeInTheDocument();
  });
});
