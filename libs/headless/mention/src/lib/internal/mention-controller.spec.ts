import { Injector } from '@angular/core';
import { NoopScrollStrategy, RepositionScrollStrategy } from '@nexora-ui/overlay';
import { of, Subject } from 'rxjs';

import type { MentionTriggerConfig } from '../types/mention-types';

import type { MentionControllerCallbacks, MentionControllerInit } from './mention-controller';
import { MentionControllerImpl } from './mention-controller';

/** Controllers created during a test; disposed in afterEach to release fetch pipeline subscriptions. */
const controllersToDispose: MentionControllerImpl[] = [];

describe('MentionControllerImpl', () => {
  afterEach(() => {
    while (controllersToDispose.length) {
      const c = controllersToDispose.pop();
      if (c) c.dispose();
    }
  });
  async function flushMicrotasks(times = 3): Promise<void> {
    await Array.from({ length: times }, () => Promise.resolve()).reduce(
      (p, x) => p.then(() => x),
      Promise.resolve(),
    );
  }

  function createController<T extends { id: string } = { id: string }>(
    options: {
      adapter?: Partial<{
        getSnapshot: () => {
          version: number;
          value: string;
          document: { bodyText: string; mentions: readonly unknown[] };
          lockedMentionTextRanges?: ReadonlyArray<{ start: number; end: number }>;
        };
        getSnapshotVersion: () => number;
        getDocument: () => { bodyText: string; mentions: readonly unknown[] };
        getSelectionStart: () => number | null;
        isSelectionCollapsed: () => boolean;
        getCaretRect: () => DOMRect | null;
        getRectAtLinearOffset: (offset: number) => DOMRect | null;
        replaceTextRange: (
          start: number,
          end: number,
          replacement: unknown,
          caretOffset?: number,
          baseChipClass?: string,
        ) => void;
        removeMentionBeforeCaret: () => boolean;
        insertLineBreak: () => void;
        subscribe: (callbacks: unknown) => () => void;
      }>;
      trigger?: Partial<MentionTriggerConfig<T>>;
      callbacks?: MentionControllerCallbacks<T>;
      debounceMs?: number;
      attachResult?: boolean;
      deferredAttach?: boolean;
      overlayConfigCapture?: { config: unknown };
      init?: Partial<MentionControllerInit<T>>;
    } = {},
  ): {
    controller: MentionControllerImpl<T>;
    replaceTextRange: ReturnType<typeof vi.fn>;
    overlayRef: {
      attach: ReturnType<typeof vi.fn>;
      afterClosed: () => ReturnType<Subject<void>['asObservable']>;
      close: ReturnType<typeof vi.fn>;
      reposition: ReturnType<typeof vi.fn>;
      dispose: ReturnType<typeof vi.fn>;
    };
    resolveAttach: (opened: boolean) => void;
  } {
    const replaceTextRange = vi.fn();

    const adapter = {
      getDocument: () => ({ bodyText: '@x', mentions: [] as const }),
      getSnapshot: () => ({
        version: 0,
        value: '@x',
        document: { bodyText: '@x', mentions: [] as const },
      }),
      getSnapshotVersion: () => 0,
      getSelectionStart: () => 2,
      isSelectionCollapsed: () => true,
      getCaretRect: () => new DOMRect(0, 0, 1, 1),
      getRectAtLinearOffset: () => new DOMRect(0, 0, 1, 1),
      replaceTextRange,
      subscribe: () => () => {},
      ...options.adapter,
    };

    const trigger: MentionTriggerConfig<T> = {
      trigger: '@',
      openOnTrigger: true,
      getItems: () => of([{ id: 'a' } as T]),
      displayWith: (item: T) => item.id,
      ...options.trigger,
    };

    const afterClosed$ = new Subject<void>();

    let resolveAttach = (opened: boolean) => {
      void opened;
    };

    const attach = options.deferredAttach
      ? vi.fn().mockImplementation(
          () =>
            new Promise<boolean>((resolve) => {
              resolveAttach = resolve;
            }),
        )
      : vi.fn().mockResolvedValue(options.attachResult ?? true);

    const overlayRef = {
      attach,
      afterClosed: () => afterClosed$.asObservable(),
      close: vi.fn().mockImplementation(async () => {
        afterClosed$.next();
        afterClosed$.complete();

        return true;
      }),
      reposition: vi.fn(),
      dispose: vi.fn(),
    };

    const init: MentionControllerInit<T> = {
      adapter: adapter as MentionControllerInit<T>['adapter'],
      triggerConfigs: [trigger],
      overlay: {
        create: (config: unknown) => {
          if (options.overlayConfigCapture) {
            options.overlayConfigCapture.config = config;
          }

          return overlayRef;
        },
      } as MentionControllerInit<T>['overlay'],
      viewContainerRef: {} as MentionControllerInit<T>['viewContainerRef'],
      panelTemplateRef: {} as MentionControllerInit<T>['panelTemplateRef'],
      parentInjector: Injector.NULL,
      callbacks: options.callbacks,
      debounceMs: options.debounceMs,
      ...options.init,
    };

    const controller = new MentionControllerImpl(init);
    controllersToDispose.push(controller);

    return {
      controller,
      replaceTextRange,
      overlayRef,
      resolveAttach: (opened: boolean) => resolveAttach(opened),
    };
  }

  it('handleKeydown Backspace when closed delegates to removeMentionBeforeCaret', () => {
    const removeMentionBeforeCaret = vi.fn().mockReturnValue(true);
    const { controller } = createController({
      adapter: { removeMentionBeforeCaret },
    });
    const ev = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true });
    const pd = vi.spyOn(ev, 'preventDefault');
    const sp = vi.spyOn(ev, 'stopPropagation');
    controller.handleKeydown(ev);
    expect(removeMentionBeforeCaret).toHaveBeenCalled();
    expect(pd).toHaveBeenCalled();
    expect(sp).toHaveBeenCalled();
  });

  it('handleKeydown Enter when closed calls insertLineBreak', () => {
    const insertLineBreak = vi.fn();
    const { controller } = createController({
      adapter: { insertLineBreak },
    });
    const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const pd = vi.spyOn(ev, 'preventDefault');
    controller.handleKeydown(ev);
    expect(insertLineBreak).toHaveBeenCalled();
    expect(pd).toHaveBeenCalled();
  });

  it('handleKeydown Escape when open closes overlay', async () => {
    const { controller, overlayRef } = createController();
    controller.runSessionCheck();
    await Promise.resolve();
    await Promise.resolve();

    const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    vi.spyOn(ev, 'preventDefault');
    controller.handleKeydown(ev);
    expect(overlayRef.close).toHaveBeenCalled();
  });

  it('select inserts replacement and invokes onSelect callback', async () => {
    const onSelect = vi.fn();

    const { controller, replaceTextRange } = createController<{ id: string }>({
      trigger: {
        getItems: () => of([{ id: 'pick' }]),
      },
      callbacks: { onSelect },
    });

    controller.runSessionCheck();
    await Promise.resolve();
    await Promise.resolve();

    controller.select({ id: 'pick' });
    expect(replaceTextRange).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith({ item: { id: 'pick' }, trigger: '@' });
  });

  it('select does not insert when beforeInsert returns false', async () => {
    const { controller, replaceTextRange } = createController({
      trigger: {
        getItems: () => of([{ id: 'pick' }]),
        beforeInsert: () => false,
      },
    });

    controller.runSessionCheck();
    await Promise.resolve();
    await Promise.resolve();

    controller.select({ id: 'pick' });
    expect(replaceTextRange).not.toHaveBeenCalled();
  });

  it('debounces getItems when debounceMs is configured', async () => {
    vi.useFakeTimers();
    try {
      const getItems = vi.fn(() => of([{ id: 'pick' }]));
      const { controller } = createController({
        trigger: { getItems },
        debounceMs: 40,
      });

      controller.runSessionCheck();
      await flushMicrotasks(2);
      expect(getItems).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(39);
      expect(getItems).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(getItems).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores stale async getItems results from previous session', async () => {
    const first$ = new Subject<Array<{ id: string }>>();
    const second$ = new Subject<Array<{ id: string }>>();
    const getItems = vi
      .fn()
      .mockReturnValueOnce(first$.asObservable())
      .mockReturnValueOnce(second$.asObservable());

    const { controller } = createController({
      trigger: { getItems },
    });

    controller.runSessionCheck();
    await flushMicrotasks(2);
    controller.runSessionCheck();
    await flushMicrotasks(2);

    first$.next([{ id: 'stale' }]);
    await flushMicrotasks(1);
    expect(controller.panelState().items).toEqual([]);

    second$.next([{ id: 'fresh' }]);
    await flushMicrotasks(1);
    expect(controller.panelState().items).toEqual([{ id: 'fresh' }]);
  });

  it('closes when no results and closeOnNoResults is true', async () => {
    const { controller } = createController({
      trigger: {
        closeOnNoResults: true,
        getItems: () => of([]),
      },
    });

    controller.runSessionCheck();
    await flushMicrotasks(4);

    expect(controller.panelState().open).toBe(false);
  });

  it('resets open state when overlay attach is vetoed', async () => {
    const onOpenChange = vi.fn();
    const { controller, overlayRef } = createController({
      attachResult: false,
      callbacks: { onOpenChange },
    });

    controller.runSessionCheck();
    await flushMicrotasks(4);

    expect(overlayRef.attach).toHaveBeenCalledTimes(1);
    expect(controller.panelState().open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('emits open=true once while already open across repeated checks', async () => {
    const onOpenChange = vi.fn();
    const { controller } = createController({
      callbacks: { onOpenChange },
    });

    controller.runSessionCheck();
    await flushMicrotasks(4);
    controller.runSessionCheck();
    await flushMicrotasks(2);

    const openTrueCalls = onOpenChange.mock.calls.filter((args) => args[0] === true);
    expect(openTrueCalls).toHaveLength(1);
    expect(controller.panelState().open).toBe(true);
  });

  it('can retry open after repeated attach vetoes', async () => {
    const onOpenChange = vi.fn();
    const { controller } = createController({
      attachResult: false,
      callbacks: { onOpenChange },
    });

    controller.runSessionCheck();
    await flushMicrotasks(4);
    controller.runSessionCheck();
    await flushMicrotasks(4);

    expect(controller.panelState().open).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
  });

  it('can close and reopen quickly with transition events', async () => {
    const onOpenChange = vi.fn();
    const { controller, overlayRef } = createController({
      callbacks: { onOpenChange },
    });

    controller.runSessionCheck();
    await flushMicrotasks(4);
    await controller.close();
    await flushMicrotasks(2);
    controller.runSessionCheck();
    await flushMicrotasks(4);

    expect(overlayRef.close).toHaveBeenCalledTimes(1);
    expect(controller.panelState().open).toBe(true);
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it('falls back to fresh snapshot when scheduled snapshot becomes stale', async () => {
    let version = 1;
    const onOpenChange = vi.fn();

    const getSnapshot = vi.fn(() => ({
      version,
      value: '@x',
      document: { bodyText: '@x', mentions: [] as const },
      lockedMentionTextRanges: [] as const,
    }));

    const { controller } = createController({
      adapter: {
        getSnapshot,
        getSnapshotVersion: () => version,
        getDocument: () => ({ bodyText: '@x', mentions: [] as const }),
      },
      callbacks: { onOpenChange },
    });

    const staleSnapshot = {
      version: 1,
      value: '@x',
      document: { bodyText: '@x', mentions: [] as const },
      lockedMentionTextRanges: [] as const,
    };
    version = 2;
    controller.runSessionCheck(staleSnapshot);
    await flushMicrotasks(3);

    expect(getSnapshot).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(controller.panelState().open).toBe(true);
  });

  it('does not keep overlay open when closed during pending attach', async () => {
    const onOpenChange = vi.fn();
    const { controller, overlayRef, resolveAttach } = createController({
      deferredAttach: true,
      callbacks: { onOpenChange },
    });

    controller.runSessionCheck();
    await flushMicrotasks(2);
    expect(overlayRef.attach).toHaveBeenCalledTimes(1);
    controller.close();
    resolveAttach(true);
    await flushMicrotasks(4);

    expect(overlayRef.dispose).toHaveBeenCalled();
    expect(controller.panelState().open).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('uses RepositionScrollStrategy in overlay config by default', async () => {
    const capture: { config?: unknown } = {};
    const { controller } = createController({ overlayConfigCapture: capture });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    expect((capture.config as { scrollStrategy: unknown }).scrollStrategy).toBeInstanceOf(
      RepositionScrollStrategy,
    );
  });

  it('uses trigger panel scrollStrategy when set', async () => {
    const noop = new NoopScrollStrategy();
    const capture: { config?: unknown } = {};
    const { controller } = createController({
      overlayConfigCapture: capture,
      trigger: { panel: { scrollStrategy: noop } },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    expect((capture.config as { scrollStrategy: unknown }).scrollStrategy).toBe(noop);
  });

  it('composed beforeOpen runs directive hook then trigger panel hook', async () => {
    const capture: { config?: unknown } = {};
    const directive = vi.fn().mockReturnValue(undefined);
    const triggerHook = vi.fn().mockReturnValue(undefined);
    const { controller } = createController({
      overlayConfigCapture: capture,
      trigger: { panel: { beforeOpen: triggerHook } },
      init: { beforeOpen: directive },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    const beforeOpen = (capture.config as { beforeOpen?: () => Promise<unknown> }).beforeOpen;
    expect(beforeOpen).toBeDefined();
    await (beforeOpen as () => Promise<unknown>)();
    expect(directive).toHaveBeenCalledBefore(triggerHook);
  });

  it('composed beforeOpen does not run trigger hook when directive returns false', async () => {
    const capture: { config?: unknown } = {};
    const triggerHook = vi.fn();

    const { controller } = createController({
      overlayConfigCapture: capture,
      trigger: { panel: { beforeOpen: triggerHook } },
      init: { beforeOpen: () => false },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    const beforeOpen = (capture.config as { beforeOpen?: () => Promise<unknown> }).beforeOpen;
    await expect((beforeOpen as () => Promise<unknown>)()).resolves.toBe(false);
    expect(triggerHook).not.toHaveBeenCalled();
  });

  it('merges trigger panel panelClass into overlay pane classes', async () => {
    const capture: { config?: unknown } = {};
    const { controller } = createController({
      overlayConfigCapture: capture,
      trigger: { panel: { panelClass: 'my-mention-panel' } },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    expect((capture.config as { panelClass: string | string[] }).panelClass).toEqual(
      expect.arrayContaining(['nxr-mention-overlay-pane', 'my-mention-panel']),
    );
  });

  it('merges directive panelStyle defaults with trigger panelStyle overrides', async () => {
    const capture: { config?: unknown } = {};
    const { controller } = createController({
      overlayConfigCapture: capture,
      init: { overlayPanelExtraStyle: { maxWidth: '24rem', borderRadius: '8px' } },
      trigger: { panel: { panelStyle: { borderRadius: '4px' } } },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    expect((capture.config as { panelStyle?: Record<string, string> }).panelStyle).toEqual({
      maxWidth: '24rem',
      borderRadius: '4px',
    });
  });

  it('uses panel closeAnimationDurationMs over directive default', async () => {
    const capture: { config?: unknown } = {};
    const { controller } = createController({
      overlayConfigCapture: capture,
      init: { closeAnimationDurationMs: 150 },
      trigger: { panel: { closeAnimationDurationMs: 99 } },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    expect((capture.config as { closeAnimationDurationMs?: number }).closeAnimationDurationMs).toBe(
      99,
    );
  });

  it('forwards panel ariaLabel to overlay config', async () => {
    const capture: { config?: unknown } = {};
    const { controller } = createController({
      overlayConfigCapture: capture,
      trigger: { panel: { ariaLabel: 'User suggestions' } },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    expect((capture.config as { ariaLabel?: string }).ariaLabel).toBe('User suggestions');
  });

  it('forwards panel arrowSize to overlay config', async () => {
    const capture: { config?: unknown } = {};
    const { controller } = createController({
      overlayConfigCapture: capture,
      trigger: { panel: { arrowSize: { width: 10, height: 5 } } },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    expect((capture.config as { arrowSize?: { width: number; height: number } }).arrowSize).toEqual(
      { width: 10, height: 5 },
    );
  });

  it('merges panel closePolicy but forces backdrop to none', async () => {
    const capture: { config?: unknown } = {};
    const { controller } = createController({
      overlayConfigCapture: capture,
      trigger: {
        panel: {
          closePolicy: { escape: 'none' as const, backdrop: 'self' as const },
        },
      },
    });

    controller.runSessionCheck();
    await flushMicrotasks(3);

    const policy = (capture.config as { closePolicy?: { escape?: string; backdrop?: string } })
      .closePolicy;
    expect(policy?.escape).toBe('none');
    expect(policy?.backdrop).toBe('none');
  });
});
