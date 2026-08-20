/**
 * DTOs espelhando os contratos reais do back-end
 * (HelpDesk.Api/Contracts/Authentication, ver C:\dev\HelpDeskAPI).
 * Não reutilizar estes tipos como estado de formulário — formulários
 * têm campos e regras de validação próprios (ver features/auth/schema.ts).
 */

export interface AuthenticatedUserResponse {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthenticationResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthenticatedUserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
}

/** application/problem+json — RFC 7807, retornado pelo ApiExceptionHandler. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

/** ProblemDetails com dicionário de erros por campo (ASP.NET model validation). */
export interface ValidationProblemDetails extends ProblemDetails {
  errors?: Record<string, string[]>;
}
