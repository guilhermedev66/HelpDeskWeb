import type { ProblemDetails, ValidationProblemDetails } from '../types/api';
import { readSession, clearSession } from './tokenStorage';
import { emitUnauthorized } from './authEvents';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Erro tipado a partir de um ProblemDetails/ValidationProblemDetails da API. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Erro de rede: API indisponível, DNS, timeout, etc. — não é um ApiError porque não há resposta HTTP. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Não foi possível conectar à API. Verifique sua conexão e tente novamente.');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** Requisições de auth (login/register) não devem disparar o fluxo global de 401. */
  skipUnauthorizedEvent?: boolean;
}

async function parseErrorBody(response: Response): Promise<ProblemDetails | ValidationProblemDetails | null> {
  try {
    return (await response.json()) as ProblemDetails | ValidationProblemDetails;
  } catch {
    return null;
  }
}

function messageFromProblem(
  problem: ProblemDetails | ValidationProblemDetails | null,
  status: number,
): string {
  if (problem?.detail) return problem.detail;
  if (problem?.title) return problem.title;
  switch (status) {
    case 400:
      return 'Não foi possível concluir a operação por um erro de validação.';
    case 401:
      return 'Sua sessão expirou. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para realizar esta operação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Este registro foi alterado por outra pessoa. Recarregue e tente novamente.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const session = readSession();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (session) headers.Authorization = `Bearer ${session.accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (cause) {
    throw new NetworkError(cause);
  }

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    const problem = await parseErrorBody(response);
    const fieldErrors = problem && 'errors' in problem ? problem.errors : undefined;

    if (response.status === 401 && !options.skipUnauthorizedEvent) {
      clearSession();
      emitUnauthorized();
    }

    throw new ApiError(response.status, messageFromProblem(problem, response.status), fieldErrors);
  }

  return (await response.json()) as T;
}
