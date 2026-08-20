import { apiRequest } from '../../lib/httpClient';
import type { AuthenticatedUserResponse, AuthenticationResponse, LoginRequest } from '../../types/api';

export function login(request: LoginRequest): Promise<AuthenticationResponse> {
  return apiRequest<AuthenticationResponse>('/auth/login', {
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
