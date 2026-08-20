import { describe, expect, it } from 'vitest';
import { getFirstResponseSlaVisual, getResolutionSlaVisual } from './sla';

const NOW = new Date('2026-08-20T12:00:00.000Z');

describe('getResolutionSlaVisual', () => {
  it('marca como done quando o chamado já está resolvido, mesmo com prazo vencido', () => {
    expect(getResolutionSlaVisual('Resolved', '2026-08-20T10:00:00.000Z', NOW).tone).toBe('done');
  });

  it('marca como done quando o chamado está fechado', () => {
    expect(getResolutionSlaVisual('Closed', '2026-08-20T10:00:00.000Z', NOW).tone).toBe('done');
  });

  it('marca como breached quando o prazo já passou e o chamado segue aberto', () => {
    const visual = getResolutionSlaVisual('InProgress', '2026-08-20T10:00:00.000Z', NOW);
    expect(visual.tone).toBe('breached');
  });

  it('marca como at-risk dentro da janela de 4h antes do prazo', () => {
    const visual = getResolutionSlaVisual('Open', '2026-08-20T15:00:00.000Z', NOW);
    expect(visual.tone).toBe('at-risk');
  });

  it('marca como ok quando o prazo está longe', () => {
    const visual = getResolutionSlaVisual('Open', '2026-08-22T12:00:00.000Z', NOW);
    expect(visual.tone).toBe('ok');
  });
});

describe('getFirstResponseSlaVisual', () => {
  it('marca como done quando já houve primeira resposta', () => {
    const visual = getFirstResponseSlaVisual('2026-08-20T10:00:00.000Z', '2026-08-20T09:00:00.000Z', NOW);
    expect(visual.tone).toBe('done');
    expect(visual.label).toBe('Cumprida');
  });

  it('marca como breached quando não houve resposta e o prazo passou', () => {
    const visual = getFirstResponseSlaVisual('2026-08-20T10:00:00.000Z', null, NOW);
    expect(visual.tone).toBe('breached');
  });
});
