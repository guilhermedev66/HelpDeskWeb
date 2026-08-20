import type { TicketStatus } from '../../types/api';

/**
 * Espelha AllowedTransitions em Ticket.cs (C:\dev\HelpDeskAPI\src\HelpDesk.Core\Tickets\Ticket.cs) —
 * só pra não oferecer opções que o back-end vai rejeitar. É uma dica visual: quem garante a regra
 * de verdade é o back-end (a mutação sempre pode voltar 400 mesmo que a UI ache que é válida).
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  Open: ['InProgress'],
  InProgress: ['WaitingForUser', 'Resolved'],
  WaitingForUser: ['InProgress'],
  Resolved: ['InProgress', 'Closed'],
  Closed: [],
};
