import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const VALID_CREDENTIALS = { email: 'agente@helpdesk.com', password: 'senha-super-secreta' };
export const EXISTING_EMAIL = 'ja-cadastrado@helpdesk.com';

export const AUTH_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  email: VALID_CREDENTIALS.email,
  displayName: 'Marina Alves',
  roles: ['Agent'],
};

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
];

export const server = setupServer(...handlers);
