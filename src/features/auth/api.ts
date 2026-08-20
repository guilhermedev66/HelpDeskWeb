import { apiRequest } from '../../lib/httpClient';
import type {
  AuthenticatedUserResponse,
  AuthenticationResponse,
  LoginRequest,
  RegisterRequest,
} from '../../types/api';

export function login(request: LoginRequest): Promise<AuthenticationResponse> {
  return apiRequest<AuthenticationResponse>('/auth/login', {
    method: 'POST',
    body: request,
    skipUnauthorizedEvent: true,
  });
}

export function register(request: RegisterRequest): Promise<AuthenticationResponse> {
  return apiRequest<AuthenticationResponse>('/auth/register', {
    method: 'POST',
    body: request,
    skipUnauthorizedEvent: true,
  });
}

export function fetchCurrentUser(): Promise<AuthenticatedUserResponse> {
  return apiRequest<AuthenticatedUserResponse>('/auth/me', {
    skipUnauthorizedEvent: true,
  });
}
