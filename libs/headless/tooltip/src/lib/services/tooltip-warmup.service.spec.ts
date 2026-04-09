import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TOOLTIP_WARMUP_CONFIG } from './tooltip-warmup.config';
import { TooltipWarmupService } from './tooltip-warmup.service';

describe('TooltipWarmupService', () => {
  let service: TooltipWarmupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TooltipWarmupService);
  });

  it('returns false when no active tooltip exists', () => {
    expect(service.requestHandoff(1)).toBe(false);
  });

  it('requests immediate close from previously opened tooltip', () => {
    const first = service.createInstanceId();
    const second = service.createInstanceId();
    const closeSpy = vi.fn();

    service.registerOpened(first, closeSpy);

    expect(service.requestHandoff(second)).toBe(true);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not handoff to the same tooltip instance', () => {
    const id = service.createInstanceId();
    const closeSpy = vi.fn();
    service.registerOpened(id, closeSpy);

    expect(service.requestHandoff(id)).toBe(false);
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('supports warmup window after full close when configured', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: TOOLTIP_WARMUP_CONFIG, useValue: { warmupWindowMs: 500 } }],
    });
    const configuredService = TestBed.inject(TooltipWarmupService);

    configuredService.notifyClosed();

    expect(configuredService.requestHandoff(1)).toBe(true);

    vi.advanceTimersByTime(600);
    expect(configuredService.requestHandoff(2)).toBe(false);
    vi.useRealTimers();
  });
});
