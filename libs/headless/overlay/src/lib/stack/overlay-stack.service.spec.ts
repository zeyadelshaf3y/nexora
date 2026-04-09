import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { OVERLAY_BASE_Z_INDEX } from '../defaults/overlay-z-index';
import type { OverlayRef } from '../ref/overlay-ref';

import { OverlayStackService } from './overlay-stack.service';

const BASE = 10_000;

function createMockRef(id: string): OverlayRef & {
  readonly setZIndex: ReturnType<typeof vi.fn>;
  readonly getBaseZIndex: ReturnType<typeof vi.fn>;
} {
  const setZIndex = vi.fn();
  const getBaseZIndex = vi.fn<() => number | undefined>();

  return {
    id,
    scopeId: 'global',
    attach: vi.fn(),
    detach: vi.fn(),
    dispose: vi.fn(),
    close: vi.fn(),
    setCloseAnimationDurationMs: vi.fn(),
    afterClosed: () => of(undefined),
    getPaneElement: vi.fn(() => null),
    getBackdropElement: vi.fn(() => null),
    getClosePolicy: vi.fn(() => ({ escape: 'top', outside: 'top', backdrop: 'none' })),
    containsAnchor: vi.fn(),
    getOutsideClickBoundary: vi.fn(() => null),
    getParentRef: vi.fn(() => null),
    notifyOutsideClickAttempted: vi.fn(),
    reposition: vi.fn(),
    setZIndex,
    getBaseZIndex,
  } as unknown as OverlayRef & {
    readonly setZIndex: ReturnType<typeof vi.fn>;
    readonly getBaseZIndex: ReturnType<typeof vi.fn>;
  };
}

describe('OverlayStackService', () => {
  function setup(): OverlayStackService {
    TestBed.configureTestingModule({
      providers: [OverlayStackService, { provide: OVERLAY_BASE_Z_INDEX, useValue: BASE }],
    });

    return TestBed.inject(OverlayStackService);
  }

  it('orders bottom-to-top and assigns z-index base + index', () => {
    const stack = setup();
    const a = createMockRef('a');
    const b = createMockRef('b');

    stack.register(a);
    stack.register(b);

    expect(stack.getStack()).toEqual([a, b]);
    expect(stack.getTop()).toBe(b);
    expect(a.setZIndex).toHaveBeenLastCalledWith(BASE);
    expect(b.setZIndex).toHaveBeenLastCalledWith(BASE + 1);
  });

  it('reindexes z-order and refStackIndex after removing a middle ref', () => {
    const stack = setup();
    const a = createMockRef('a');
    const b = createMockRef('b');
    const c = createMockRef('c');

    stack.register(a);
    stack.register(b);
    stack.register(c);
    vi.mocked(a.setZIndex).mockClear();
    vi.mocked(b.setZIndex).mockClear();
    vi.mocked(c.setZIndex).mockClear();

    stack.unregister(b);

    expect(stack.getStack()).toEqual([a, c]);
    expect(stack.getTop()).toBe(c);
    expect(a.setZIndex).toHaveBeenCalledWith(BASE);
    expect(c.setZIndex).toHaveBeenCalledWith(BASE + 1);
  });

  it('throws when registering a duplicate overlay id', () => {
    const stack = setup();
    const a = createMockRef('same');
    const b = createMockRef('same');

    stack.register(a);
    expect(() => stack.register(b)).toThrow(/duplicate id/);
  });

  it('does not mutate ids or stack when unregistering an unknown ref (even with a colliding id)', () => {
    const stack = setup();
    const real = createMockRef('x');
    const impostor = createMockRef('x');

    stack.register(real);
    stack.unregister(impostor);

    expect(stack.getStack()).toEqual([real]);
    expect(() => stack.register(createMockRef('x'))).toThrow(/duplicate id/);
  });

  it('applies getBaseZIndex override when finite', () => {
    const stack = setup();
    const a = createMockRef('a');
    a.getBaseZIndex.mockReturnValue(99_999);

    stack.register(a);

    expect(a.setZIndex).toHaveBeenCalledWith(99_999);
  });
});
