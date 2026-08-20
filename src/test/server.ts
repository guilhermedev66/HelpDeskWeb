import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type {
  CategoryResponse,
  TicketCommentResponse,
  TicketDetailsResponse,
  TicketHistoryResponse,
  TicketSummaryResponse,
} from '../types/api';

export const VALID_CREDENTIALS = { email: 'agente@helpdesk.com', password: 'senha-super-secreta' };
export const EXISTING_EMAIL = 'ja-cadastrado@helpdesk.com';

export const AUTH_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  email: VALID_CREDENTIALS.email,
  displayName: 'Marina Alves',
  roles: ['Agent'],
};

export const ADMIN_USER = {
  id: '33333333-3333-3333-3333-333333333333',
  email: 'admin@helpdesk.com',
  displayName: 'Diego Prado',
  roles: ['Admin'],
};

export const PLAIN_USER = {
  id: '99999999-0000-0000-0000-000000000001',
  email: 'usuario@helpdesk.com',
  displayName: 'Carlos Andrade',
  roles: ['User'],
};

export const CATEGORY_FIXTURES: CategoryResponse[] = [
  { id: 'aaaaaaaa-0000-0000-0000-000000000001', name: 'Hardware' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000002', name: 'Rede' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000003', name: 'Acessos' },
];

export const TICKET_FIXTURES: TicketSummaryResponse[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Impressora do 3º andar não imprime',
    priority: 'High',
    status: 'InProgress',
    categoryId: CATEGORY_FIXTURES[0].id,
    createdByUserId: '99999999-0000-0000-0000-000000000001',
    assignedAgentId: AUTH_USER.id,
    createdAt: '2026-08-18T09:00:00.000Z',
    firstResponseDueAt: '2026-08-18T13:00:00.000Z',
    resolutionDueAt: '2026-08-18T21:00:00.000Z',
    version: 3,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Erro ao acessar VPN pelo notebook',
    priority: 'Critical',
    status: 'Open',
    categoryId: CATEGORY_FIXTURES[1].id,
    createdByUserId: '99999999-0000-0000-0000-000000000002',
    assignedAgentId: null,
    createdAt: '2026-08-19T08:00:00.000Z',
    firstResponseDueAt: '2026-08-19T09:00:00.000Z',
    resolutionDueAt: '2026-08-19T12:00:00.000Z',
    version: 1,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Solicitação de acesso ao sistema financeiro',
    priority: 'Medium',
    status: 'WaitingForUser',
    categoryId: CATEGORY_FIXTURES[2].id,
    createdByUserId: '99999999-0000-0000-0000-000000000001',
    assignedAgentId: AUTH_USER.id,
    createdAt: '2026-08-17T10:00:00.000Z',
    firstResponseDueAt: '2026-08-17T18:00:00.000Z',
    resolutionDueAt: '2026-08-18T10:00:00.000Z',
    version: 2,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Notebook não liga',
    priority: 'Medium',
    status: 'InProgress',
    categoryId: CATEGORY_FIXTURES[0].id,
    createdByUserId: PLAIN_USER.id,
    assignedAgentId: '55555555-5555-5555-5555-555555555555', // outro agente, não o AUTH_USER
    createdAt: '2026-08-16T10:00:00.000Z',
    firstResponseDueAt: '2026-08-16T18:00:00.000Z',
    resolutionDueAt: '2026-08-17T10:00:00.000Z',
    version: 1,
  },
];

function buildTicketDetailsFixtures(): Map<string, TicketDetailsResponse> {
  return new Map(
    TICKET_FIXTURES.map((ticket) => [
      ticket.id,
      {
        ...ticket,
        description: `Descrição de teste para "${ticket.title}".`,
        firstRespondedAt: null,
        resolvedAt: null,
        closedAt: null,
      },
    ]),
  );
}

// Mutável (assign/status/priority escrevem aqui) — precisa ser reconstruído entre testes.
let TICKET_DETAILS_BY_ID = buildTicketDetailsFixtures();

/** Chamado no afterEach do setup.ts — mutações de um teste não podem vazar pro próximo. */
export function resetTicketFixtures(): void {
  TICKET_DETAILS_BY_ID = buildTicketDetailsFixtures();
}

export const COMMENT_FIXTURES: TicketCommentResponse[] = [
  {
    id: 'c1',
    authorUserId: AUTH_USER.id,
    authorDisplayName: AUTH_USER.displayName,
    body: 'Recebido, vou verificar.',
    createdAt: '2026-08-18T10:00:00.000Z',
  },
];

export const HISTORY_FIXTURES: TicketHistoryResponse[] = [
  {
    id: 'h1',
    actorUserId: '99999999-0000-0000-0000-000000000001',
    actorDisplayName: 'Carlos Andrade',
    eventType: 'Created',
    occurredAt: '2026-08-18T09:00:00.000Z',
    previousValue: null,
    newValue: 'Open',
  },
];

function paginatedTicketsHandler(request: Request) {
  const url = new URL(request.url);
  let items = TICKET_FIXTURES;

  const status = url.searchParams.get('status');
  if (status) items = items.filter((ticket) => ticket.status === status);

  const priority = url.searchParams.get('priority');
  if (priority) items = items.filter((ticket) => ticket.priority === priority);

  const categoryId = url.searchParams.get('categoryId');
  if (categoryId) items = items.filter((ticket) => ticket.categoryId === categoryId);

  const search = url.searchParams.get('search');
  if (search) items = items.filter((ticket) => ticket.title.toLowerCase().includes(search.toLowerCase()));

  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return HttpResponse.json({
    items: pageItems,
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  });
}

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === VALID_CREDENTIALS.email && body.password === VALID_CREDENTIALS.password) {
      return HttpResponse.json({
        accessToken: 'fake-jwt-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        user: AUTH_USER,
      });
    }
    return HttpResponse.json({ status: 401, title: 'Invalid email or password.' }, { status: 401 });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth === 'Bearer fake-jwt-token') {
      return HttpResponse.json(AUTH_USER);
    }
    return HttpResponse.json({ status: 401, title: 'Unauthorized' }, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; displayName: string; password: string };
    if (body.email === EXISTING_EMAIL) {
      return HttpResponse.json(
        {
          status: 400,
          title: 'One or more validation errors occurred.',
          errors: { DuplicateUserName: [`User name '${body.email}' is already taken.`] },
        },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      {
        accessToken: 'fake-jwt-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        user: {
          id: '22222222-2222-2222-2222-222222222222',
          email: body.email,
          displayName: body.displayName,
          roles: ['User'],
        },
      },
      { status: 201 },
    );
  }),

  http.get('/api/tickets', ({ request }) => paginatedTicketsHandler(request)),
  http.get('/api/categories', () => HttpResponse.json(CATEGORY_FIXTURES)),

  http.post('/api/tickets', async ({ request }) => {
    const body = (await request.json()) as {
      title: string;
      description: string;
      priority: TicketDetailsResponse['priority'];
      categoryId: string;
    };
    const created: TicketDetailsResponse = {
      id: '30000000-0000-0000-0000-000000000001',
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: 'Open',
      categoryId: body.categoryId,
      createdByUserId: AUTH_USER.id,
      assignedAgentId: null,
      createdAt: new Date().toISOString(),
      firstRespondedAt: null,
      firstResponseDueAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      resolutionDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: null,
      closedAt: null,
      version: 1,
    };
    TICKET_DETAILS_BY_ID.set(created.id, created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get('/api/tickets/:ticketId', ({ params }) => {
    const ticket = TICKET_DETAILS_BY_ID.get(params.ticketId as string);
    if (!ticket) return HttpResponse.json({ status: 404, title: 'Resource not found.' }, { status: 404 });
    return HttpResponse.json(ticket);
  }),

  http.get('/api/tickets/:ticketId/comments', ({ params }) => {
    if (!TICKET_DETAILS_BY_ID.has(params.ticketId as string)) {
      return HttpResponse.json({ status: 404, title: 'Resource not found.' }, { status: 404 });
    }
    return HttpResponse.json(COMMENT_FIXTURES);
  }),

  http.post('/api/tickets/:ticketId/comments', async ({ request }) => {
    const body = (await request.json()) as { body: string };
    const comment: TicketCommentResponse = {
      id: `c-${Date.now()}`,
      authorUserId: AUTH_USER.id,
      authorDisplayName: AUTH_USER.displayName,
      body: body.body,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(comment, { status: 201 });
  }),

  http.get('/api/tickets/:ticketId/history', ({ params }) => {
    if (!TICKET_DETAILS_BY_ID.has(params.ticketId as string)) {
      return HttpResponse.json({ status: 404, title: 'Resource not found.' }, { status: 404 });
    }
    return HttpResponse.json(HISTORY_FIXTURES);
  }),

  http.post('/api/tickets/:ticketId/assignment', async ({ params, request }) => {
    const ticket = TICKET_DETAILS_BY_ID.get(params.ticketId as string);
    if (!ticket) return HttpResponse.json({ status: 404, title: 'Resource not found.' }, { status: 404 });
    const body = (await request.json()) as { version: number };
    if (body.version !== ticket.version) {
      return HttpResponse.json({ status: 409, title: 'Conflict.' }, { status: 409 });
    }
    const updated = { ...ticket, assignedAgentId: AUTH_USER.id, version: ticket.version + 1 };
    TICKET_DETAILS_BY_ID.set(updated.id, updated);
    return HttpResponse.json(updated);
  }),

  http.patch('/api/tickets/:ticketId/status', async ({ params, request }) => {
    const ticket = TICKET_DETAILS_BY_ID.get(params.ticketId as string);
    if (!ticket) return HttpResponse.json({ status: 404, title: 'Resource not found.' }, { status: 404 });
    const body = (await request.json()) as { status: TicketDetailsResponse['status']; version: number };
    if (body.version !== ticket.version) {
      return HttpResponse.json({ status: 409, title: 'Conflict.' }, { status: 409 });
    }
    const updated = { ...ticket, status: body.status, version: ticket.version + 1 };
    TICKET_DETAILS_BY_ID.set(updated.id, updated);
    return HttpResponse.json(updated);
  }),

  http.patch('/api/tickets/:ticketId/priority', async ({ params, request }) => {
    const ticket = TICKET_DETAILS_BY_ID.get(params.ticketId as string);
    if (!ticket) return HttpResponse.json({ status: 404, title: 'Resource not found.' }, { status: 404 });
    const body = (await request.json()) as { priority: TicketDetailsResponse['priority']; version: number };
    if (body.version !== ticket.version) {
      return HttpResponse.json({ status: 409, title: 'Conflict.' }, { status: 409 });
    }
    const updated = { ...ticket, priority: body.priority, version: ticket.version + 1 };
    TICKET_DETAILS_BY_ID.set(updated.id, updated);
    return HttpResponse.json(updated);
  }),
];

export const server = setupServer(...handlers);
