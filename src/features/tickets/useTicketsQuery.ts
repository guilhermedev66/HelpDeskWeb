import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listTickets, type TicketListParams } from './api';

export function useTicketsQuery(params: TicketListParams) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => listTickets(params),
    placeholderData: keepPreviousData,
  });
}
