import { useQuery } from '@tanstack/react-query';
import { getTicket, listTicketComments, listTicketHistory } from './api';

export function useTicketDetailsQuery(ticketId: string) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket(ticketId),
  });
}

export function useTicketCommentsQuery(ticketId: string) {
  return useQuery({
    queryKey: ['ticket', ticketId, 'comments'],
    queryFn: () => listTicketComments(ticketId),
  });
}

export function useTicketHistoryQuery(ticketId: string) {
  return useQuery({
    queryKey: ['ticket', ticketId, 'history'],
    queryFn: () => listTicketHistory(ticketId),
  });
}
