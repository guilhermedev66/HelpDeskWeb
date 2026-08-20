import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../test/server';
import { apiRequest, ApiError, NetworkError } from './httpClient';

describe('apiRequest', () => {
  it('usa o detail do ProblemDetails quando presente', async () => {
    server.use(
      http.post('/api/tickets/x/status', () =>
        HttpResponse.json(
          { status: 400, title: 'Business rule validation failed.', detail: 'Transition not allowed.' },
          { status: 400 },
        ),
      ),
    );

    await expect(apiRequest('/tickets/x/status', { method: 'POST', body: {} })).rejects.toMatchObject({
      message: 'Transition not allowed.',
      status: 400,
    });
  });

  it('cai numa mensagem padrão por status quando não há detail/title', async () => {
    server.use(http.get('/api/tickets/x', () => HttpResponse.json(null, { status: 409 })));

    await expect(apiRequest('/tickets/x')).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining('alterado por outra pessoa'),
    });
  });

  it('expõe fieldErrors de um ValidationProblemDetails', async () => {
    server.use(
      http.post('/api/tickets', () =>
        HttpResponse.json(
          {
            status: 400,
            title: 'One or more validation errors occurred.',
            errors: { Title: ['O título é obrigatório.'] },
          },
          { status: 400 },
        ),
      ),
    );

    try {
      await apiRequest('/tickets', { method: 'POST', body: {} });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).fieldErrors).toEqual({ Title: ['O título é obrigatório.'] });
    }
  });

  it('lança NetworkError quando a API está indisponível', async () => {
    server.use(http.get('/api/tickets', () => HttpResponse.error()));

    await expect(apiRequest('/tickets')).rejects.toBeInstanceOf(NetworkError);
  });
});
