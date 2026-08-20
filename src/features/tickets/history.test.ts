import { describe, expect, it } from 'vitest';
import type { TicketHistoryResponse } from '../../types/api';
import { describeHistoryEntry } from './history';

const BASE: TicketHistoryResponse = {
  id: 'h1',
  actorUserId: 'actor-1',
  actorDisplayName: 'Marina Alves',
  eventType: 'Created',
  occurredAt: '2026-08-18T09:00:00.000Z',
  previousValue: null,
  newValue: null,
};

describe('describeHistoryEntry', () => {
  it('descreve criação', () => {
    expect(describeHistoryEntry(BASE, 'user-1')).toBe('Chamado criado');
  });

  it('descreve atribuição a você', () => {
    const entry = { ...BASE, eventType: 'Assigned' as const, newValue: 'user-1' };
    expect(describeHistoryEntry(entry, 'user-1')).toBe('Atribuído a você');
  });

  it('descreve mudança de status com rótulos PT-BR', () => {
    const entry = {
      ...BASE,
      eventType: 'StatusChanged' as const,
      previousValue: 'Open',
      newValue: 'InProgress',
    };
    expect(describeHistoryEntry(entry, 'user-1')).toBe('Status alterado de "Aberto" para "Em atendimento"');
  });

  it('descreve mudança de prioridade com rótulos PT-BR', () => {
    const entry = { ...BASE, eventType: 'PriorityChanged' as const, previousValue: 'Low', newValue: 'High' };
    expect(describeHistoryEntry(entry, 'user-1')).toBe('Prioridade alterada de "Baixa" para "Alta"');
  });
});
