import { useQuery } from '@tanstack/react-query';
import { listTickets } from '../tickets/api';
import type { TicketSummaryResponse } from '../../types/api';

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
  recent: TicketSummaryResponse[];
}

// Não há endpoint de agregação no back-end — os contadores vêm de chamadas reais
// a GET /tickets com filtros diferentes (pageSize:1, só pra ler totalItems).
// A API já escopa os resultados por papel (usuário comum só vê os próprios
// chamados), então os números batem com o que a fila realmente mostra.
async function fetchDashboardStats(): Promise<DashboardStats> {
  const [recentPage, open, inProgress, resolved, high, critical] = await Promise.all([
    listTickets({ page: 1, pageSize: 5 }),
    listTickets({ page: 1, pageSize: 1, status: 'Open' }),
    listTickets({ page: 1, pageSize: 1, status: 'InProgress' }),
    listTickets({ page: 1, pageSize: 1, status: 'Resolved' }),
    listTickets({ page: 1, pageSize: 1, priority: 'High' }),
    listTickets({ page: 1, pageSize: 1, priority: 'Critical' }),
  ]);

  return {
    total: recentPage.totalItems,
    open: open.totalItems,
    inProgress: inProgress.totalItems,
    resolved: resolved.totalItems,
    highPriority: high.totalItems + critical.totalItems,
    recent: recentPage.items,
  };
}

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
}
