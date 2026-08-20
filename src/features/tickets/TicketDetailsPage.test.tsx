import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';
import { AUTH_USER, COMMENT_FIXTURES, server, TICKET_FIXTURES } from '../../test/server';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

const ASSIGNED_TICKET_ID = TICKET_FIXTURES[0].id; // atribuído a AUTH_USER (Agent)
const UNASSIGNED_TICKET_ID = TICKET_FIXTURES[1].id; // sem agente

describe('TicketDetailsPage', () => {
  it('mostra título, badges, SLA e histórico do chamado', async () => {
    seedValidSession();
    renderApp([`/tickets/${ASSIGNED_TICKET_ID}`]);

    const heading = await screen.findByRole('heading', { name: TICKET_FIXTURES[0].title });
    const headerCard = heading.closest('section') as HTMLElement;
    expect(within(headerCard).getByText('Em atendimento')).toBeInTheDocument();
    expect(within(headerCard).getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Chamado criado')).toBeInTheDocument();
  });

  it('mostra os comentários existentes', async () => {
    seedValidSession();
    renderApp([`/tickets/${ASSIGNED_TICKET_ID}`]);

    expect(await screen.findByText(COMMENT_FIXTURES[0].body)).toBeInTheDocument();
  });

  it('permite comentar quando o agente está atribuído e atualiza a lista após o sucesso', async () => {
    seedValidSession();
    let comments = [...COMMENT_FIXTURES];
    server.use(
      http.get('/api/tickets/:ticketId/comments', () => HttpResponse.json(comments)),
      http.post('/api/tickets/:ticketId/comments', async ({ request }) => {
        const body = (await request.json()) as { body: string };
        const comment = {
          id: 'new-comment',
          authorUserId: AUTH_USER.id,
          authorDisplayName: AUTH_USER.displayName,
          body: body.body,
          createdAt: new Date().toISOString(),
        };
        comments = [...comments, comment];
        return HttpResponse.json(comment, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    renderApp([`/tickets/${ASSIGNED_TICKET_ID}`]);

    await user.type(await screen.findByLabelText('Comentário'), 'Já verifiquei o driver.');
    await user.click(screen.getByRole('button', { name: 'Comentar' }));

    expect(await screen.findByText('Já verifiquei o driver.')).toBeInTheDocument();
  });

  it('desabilita o botão de comentar durante o envio (proteção contra envio duplo)', async () => {
    seedValidSession();
    server.use(
      http.post('/api/tickets/:ticketId/comments', async () => {
        await new Promise((resolve) => setTimeout(resolve, 60));
        return HttpResponse.json(
          {
            id: 'slow-comment',
            authorUserId: AUTH_USER.id,
            authorDisplayName: AUTH_USER.displayName,
            body: 'Comentário lento',
            createdAt: new Date().toISOString(),
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderApp([`/tickets/${ASSIGNED_TICKET_ID}`]);

    await user.type(await screen.findByLabelText('Comentário'), 'Comentário lento');
    await user.click(screen.getByRole('button', { name: 'Comentar' }));

    expect(screen.getByRole('button', { name: 'Comentar' })).toBeDisabled();
  });

  it('não permite comentar quando o agente não está atribuído ao chamado', async () => {
    seedValidSession();
    renderApp([`/tickets/${UNASSIGNED_TICKET_ID}`]);

    await screen.findByRole('heading', { name: TICKET_FIXTURES[1].title });
    expect(screen.getByText('Você não tem permissão para comentar neste chamado.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Comentário')).not.toBeInTheDocument();
  });

  it('não oferece formulário de comentário em chamado fechado', async () => {
    seedValidSession();
    server.use(
      http.get('/api/tickets/:ticketId', () =>
        HttpResponse.json({
          ...TICKET_FIXTURES[0],
          description: 'Descrição',
          status: 'Closed',
          firstRespondedAt: null,
          resolvedAt: null,
          closedAt: new Date().toISOString(),
        }),
      ),
    );

    renderApp([`/tickets/${ASSIGNED_TICKET_ID}`]);

    await screen.findByRole('heading', { name: TICKET_FIXTURES[0].title });
    expect(screen.getByText('Chamados fechados não recebem novos comentários.')).toBeInTheDocument();
  });

  it('mostra "chamado não encontrado" para um ID inexistente (404)', async () => {
    seedValidSession();
    renderApp(['/tickets/00000000-0000-0000-0000-000000000000']);

    expect(await screen.findByText('Chamado não encontrado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para chamados' })).toBeInTheDocument();
  });

  it('mostra erro genérico com retry para outras falhas', async () => {
    seedValidSession();
    server.use(
      http.get('/api/tickets/:ticketId', () =>
        HttpResponse.json({ status: 500, title: 'Internal Server Error' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderApp([`/tickets/${ASSIGNED_TICKET_ID}`]);

    expect(
      await screen.findByText('Não foi possível carregar o chamado. Tente novamente.'),
    ).toBeInTheDocument();

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: TICKET_FIXTURES[0].title })).toBeInTheDocument();
  });
});
