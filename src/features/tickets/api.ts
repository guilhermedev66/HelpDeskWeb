import { apiRequest } from '../../lib/httpClient';
import type {
  CategoryResponse,
  CreateTicketCommentRequest,
  CreateTicketRequest,
  PagedResponse,
  TicketCommentResponse,
  TicketDetailsResponse,
  TicketHistoryResponse,
  TicketPriority,
  TicketStatus,
  TicketSummaryResponse,
} from '../../types/api';

export interface TicketListParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  search?: string;
  page: number;
  pageSize: number;
}

function buildQueryString(params: TicketListParams): string {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.priority) query.set('priority', params.priority);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.search) query.set('search', params.search);
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  return query.toString();
}

export function listTickets(params: TicketListParams): Promise<PagedResponse<TicketSummaryResponse>> {
  return apiRequest<PagedResponse<TicketSummaryResponse>>(`/tickets?${buildQueryString(params)}`);
}

export function listCategories(): Promise<CategoryResponse[]> {
  return apiRequest<CategoryResponse[]>('/categories');
}

export function createTicket(request: CreateTicketRequest): Promise<TicketDetailsResponse> {
  return apiRequest<TicketDetailsResponse>('/tickets', { method: 'POST', body: request });
}

export function getTicket(ticketId: string): Promise<TicketDetailsResponse> {
  return apiRequest<TicketDetailsResponse>(`/tickets/${ticketId}`);
}

export function listTicketComments(ticketId: string): Promise<TicketCommentResponse[]> {
  return apiRequest<TicketCommentResponse[]>(`/tickets/${ticketId}/comments`);
}

export function addTicketComment(
  ticketId: string,
  request: CreateTicketCommentRequest,
): Promise<TicketCommentResponse> {
  return apiRequest<TicketCommentResponse>(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: request,
  });
}

export function listTicketHistory(ticketId: string): Promise<TicketHistoryResponse[]> {
  return apiRequest<TicketHistoryResponse[]>(`/tickets/${ticketId}/history`);
}

export function assignTicketToSelf(ticketId: string, version: number): Promise<TicketDetailsResponse> {
  return apiRequest<TicketDetailsResponse>(`/tickets/${ticketId}/assignment`, {
    method: 'POST',
    body: { version },
  });
}

export function changeTicketStatus(
  ticketId: string,
  status: TicketStatus,
  version: number,
): Promise<TicketDetailsResponse> {
  return apiRequest<TicketDetailsResponse>(`/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: { status, version },
  });
}

export function changeTicketPriority(
  ticketId: string,
  priority: TicketPriority,
  version: number,
): Promise<TicketDetailsResponse> {
  return apiRequest<TicketDetailsResponse>(`/tickets/${ticketId}/priority`, {
    method: 'PATCH',
    body: { priority, version },
  });
}
