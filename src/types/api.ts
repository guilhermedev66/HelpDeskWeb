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

// Enums serializados como string pelo back-end (JsonStringEnumConverter, ver Program.cs).
export type TicketStatus = 'Open' | 'InProgress' | 'WaitingForUser' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface CategoryDetailsResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface RenameCategoryRequest {
  name: string;
}

export interface ChangeCategoryStatusRequest {
  isActive: boolean;
}

export interface TicketSummaryResponse {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  categoryId: string;
  createdByUserId: string;
  assignedAgentId: string | null;
  createdAt: string;
  firstResponseDueAt: string;
  resolutionDueAt: string;
  version: number;
}

export interface TicketDetailsResponse {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  categoryId: string;
  createdByUserId: string;
  assignedAgentId: string | null;
  createdAt: string;
  firstRespondedAt: string | null;
  firstResponseDueAt: string;
  resolutionDueAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  version: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId: string;
}

export interface TicketCommentResponse {
  id: string;
  authorUserId: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
}

export interface CreateTicketCommentRequest {
  body: string;
}

export type TicketHistoryEvent =
  'Created' | 'Assigned' | 'StatusChanged' | 'PriorityChanged' | 'CategoryChanged';

export interface TicketHistoryResponse {
  id: string;
  actorUserId: string;
  actorDisplayName: string;
  eventType: TicketHistoryEvent;
  occurredAt: string;
  previousValue: string | null;
  newValue: string | null;
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
