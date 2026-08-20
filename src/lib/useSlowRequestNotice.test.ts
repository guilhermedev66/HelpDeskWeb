import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSlowRequestNotice } from './useSlowRequestNotice';

describe('useSlowRequestNotice', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fica false enquanto o atraso configurado não passa', () => {
    const { result } = renderHook(() => useSlowRequestNotice(true, 4000));

    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(3999));
    expect(result.current).toBe(false);
  });

  it('vira true depois do atraso, só se continuar ativo', () => {
    const { result } = renderHook(() => useSlowRequestNotice(true, 4000));

    act(() => vi.advanceTimersByTime(4000));
    expect(result.current).toBe(true);
  });

  it('reseta pra false assim que active vira false', () => {
    const { result, rerender } = renderHook(({ active }) => useSlowRequestNotice(active, 4000), {
      initialProps: { active: true },
    });

    act(() => vi.advanceTimersByTime(4000));
    expect(result.current).toBe(true);

    rerender({ active: false });
    expect(result.current).toBe(false);
  });

  it('não dispara se active virar false antes do atraso', () => {
    const { result, rerender } = renderHook(({ active }) => useSlowRequestNotice(active, 4000), {
      initialProps: { active: true },
    });

    act(() => vi.advanceTimersByTime(2000));
    rerender({ active: false });
    act(() => vi.advanceTimersByTime(3000));

    expect(result.current).toBe(false);
  });
});
