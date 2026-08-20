import type { TicketHistoryResponse, TicketPriority, TicketStatus } from '../../types/api';
import { PRIORITY_LABELS, STATUS_LABELS } from './labels';

function agentLabel(agentId: string | null, currentUserId: string | undefined): string {
  if (!agentId) return 'ninguém';
  return agentId === currentUserId ? 'você' : 'outro agente';
}

/** Traduz uma entrada de histórico para uma frase em PT-BR. Não recria a regra de negócio, só descreve o que já veio da API. */
export function describeHistoryEntry(
  entry: TicketHistoryResponse,
  currentUserId: string | undefined,
): string {
  switch (entry.eventType) {
    case 'Created':
      return 'Chamado criado';
    case 'Assigned':
      return `Atribuído a ${agentLabel(entry.newValue, currentUserId)}`;
    case 'StatusChanged': {
      const from = STATUS_LABELS[entry.previousValue as TicketStatus] ?? entry.previousValue;
      const to = STATUS_LABELS[entry.newValue as TicketStatus] ?? entry.newValue;
      return `Status alterado de "${from}" para "${to}"`;
    }
    case 'PriorityChanged': {
      const from = PRIORITY_LABELS[entry.previousValue as TicketPriority] ?? entry.previousValue;
      const to = PRIORITY_LABELS[entry.newValue as TicketPriority] ?? entry.newValue;
      return `Prioridade alterada de "${from}" para "${to}"`;
    }
    case 'CategoryChanged':
      return 'Categoria alterada';
    default:
      return entry.eventType;
  }
}
