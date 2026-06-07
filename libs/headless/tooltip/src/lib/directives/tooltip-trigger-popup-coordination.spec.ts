import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OVERLAY_SELECTOR_PANE, OverlayAnchorPopupRegistry } from '@nexora-ui/overlay';
import { vi } from 'vitest';

import { TooltipTriggerDirective } from './tooltip-trigger.directive';

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button nxrTooltip="Hello" [nxrTooltipOpenDelay]="0">Hover</button>`,
})
class PopupCoordHost {}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button nxrTooltip="Hello" [nxrTooltipOpenDelay]="0" [nxrTooltipCloseOnPopup]="false">
    Hover
  </button>`,
})
class PopupCoordDisabledHost {}

function flush(ms = 50): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getPanes(): NodeListOf<Element> {
  return document.querySelectorAll(OVERLAY_SELECTOR_PANE);
}

describe('TooltipTriggerDirective popup coordination (mocked registry)', () => {
  let registry: {
    isPopupOpen: ReturnType<typeof vi.fn>;
    registerTooltip: ReturnType<typeof vi.fn>;
    markOpen: ReturnType<typeof vi.fn>;
    markClosed: ReturnType<typeof vi.fn>;
  };
  let registeredClose: (() => void) | null;

  beforeEach(() => {
    registeredClose = null;
    registry = {
      isPopupOpen: vi.fn(() => false),
      registerTooltip: vi.fn((_anchor: HTMLElement, closeNow: () => void) => {
        registeredClose = closeNow;

        return () => {
          registeredClose = null;
        };
      }),
      markOpen: vi.fn(),
      markClosed: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: OverlayAnchorPopupRegistry, useValue: registry }],
    });
  });

  afterEach(async () => {
    document.querySelectorAll('[data-nxr-overlay="container"]').forEach((el) => {
      el.innerHTML = '';
    });
    await flush(10);
  });

  it('blocks hover open while a popup is open on the same anchor', async () => {
    registry.isPopupOpen.mockReturnValue(true);

    const fixture = TestBed.createComponent(PopupCoordHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();

    expect(getPanes().length).toBe(0);
  });

  it('closes an open tooltip when the registry notifies a popup open', async () => {
    const fixture = TestBed.createComponent(PopupCoordHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();
    expect(getPanes().length).toBe(1);

    registeredClose?.();
    await flush(200);

    expect(getPanes().length).toBe(0);
  });

  it('does not block hover when nxrTooltipCloseOnPopup is false', async () => {
    registry.isPopupOpen.mockReturnValue(true);

    const fixture = TestBed.createComponent(PopupCoordDisabledHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();

    expect(getPanes().length).toBe(1);
  });
});

describe('TooltipTriggerDirective popup coordination (shared registry)', () => {
  let registry: OverlayAnchorPopupRegistry;

  beforeEach(() => {
    registry = new OverlayAnchorPopupRegistry();
    TestBed.configureTestingModule({
      providers: [{ provide: OverlayAnchorPopupRegistry, useValue: registry }],
    });
  });

  afterEach(async () => {
    document.querySelectorAll('[data-nxr-overlay="container"]').forEach((el) => {
      el.innerHTML = '';
    });
    await flush(10);
  });

  it('closes an open tooltip when the shared registry marks the anchor open', async () => {
    const fixture = TestBed.createComponent(PopupCoordHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();
    expect(getPanes().length).toBe(1);

    registry.markOpen(btn);
    await flush(200);

    expect(getPanes().length).toBe(0);
    expect(registry.isPopupOpen(btn)).toBe(true);
  });
});
