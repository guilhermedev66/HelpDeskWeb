import type { TicketStatus } from '../../types/api';

export type SlaTone = 'ok' | 'at-risk' | 'breached' | 'done';

export interface SlaVisual {
  label: string;
  tone: SlaTone;
}

/**
 * Limiar só de apresentação (quando pintar o indicador de "em risco") — não é uma
 * regra de negócio. As datas-limite em si (FirstResponseDueAt/ResolutionDueAt) já
 * vêm calculadas pelo back-end a partir da prioridade; o front não recalcula prazo.
 */
const AT_RISK_WINDOW_MS = 4 * 60 * 60 * 1000;

const relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' });

function formatDeadlineLabel(diffMs: number): string {
  const absMs = Math.abs(diffMs);
  const sign = diffMs < 0 ? -1 : 1;
  const hours = absMs / (60 * 60 * 1000);

  if (hours < 1) {
    const minutes = Math.max(1, Math.round(absMs / 60_000));
    return relativeFormatter.format(sign * minutes, 'minute');
  }
  if (hours < 24) {
    return relativeFormatter.format(sign * Math.round(hours), 'hour');
  }
  const days = Math.round(hours / 24);
  return relativeFormatter.format(sign * days, 'day');
}

function deadlineVisual(dueAt: string, now: Date): SlaVisual {
  const diffMs = new Date(dueAt).getTime() - now.getTime();
  const label = formatDeadlineLabel(diffMs);
  if (diffMs < 0) return { label, tone: 'breached' };
  if (diffMs <= AT_RISK_WINDOW_MS) return { label, tone: 'at-risk' };
  return { label, tone: 'ok' };
}

/** SLA de resolução — usado na listagem e nos detalhes. */
export function getResolutionSlaVisual(
  status: TicketStatus,
  resolutionDueAt: string,
  now: Date = new Date(),
): SlaVisual {
  if (status === 'Resolved') return { label: 'Resolvido', tone: 'done' };
  if (status === 'Closed') return { label: 'Fechado', tone: 'done' };
  return deadlineVisual(resolutionDueAt, now);
}

/** SLA de primeira resposta — só existe granularidade suficiente (firstRespondedAt) nos detalhes. */
export function getFirstResponseSlaVisual(
  firstResponseDueAt: string,
  firstRespondedAt: string | null,
  now: Date = new Date(),
): SlaVisual {
  if (firstRespondedAt) return { label: 'Cumprida', tone: 'done' };
  return deadlineVisual(firstResponseDueAt, now);
}
