import type { TicketPriority, TicketStatus } from '../../types/api';

/** Mapeamento centralizado enum → rótulo PT-BR. Não duplicar em outros componentes. */
export const STATUS_LABELS: Record<TicketStatus, string> = {
  Open: 'Aberto',
  InProgress: 'Em atendimento',
  WaitingForUser: 'Aguardando usuário',
  Resolved: 'Resolvido',
  Closed: 'Fechado',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  Low: 'Baixa',
  Medium: 'Média',
  High: 'Alta',
  Critical: 'Crítica',
};

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as TicketStatus[];
export const PRIORITY_OPTIONS = Object.keys(PRIORITY_LABELS) as TicketPriority[];
