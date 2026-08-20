import { apiRequest } from '../../lib/httpClient';
import type {
  CategoryResponse,
  CreateTicketRequest,
  PagedResponse,
  TicketDetailsResponse,
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
