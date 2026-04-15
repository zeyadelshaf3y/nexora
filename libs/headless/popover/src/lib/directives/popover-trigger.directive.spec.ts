import { Component, ViewChild, signal, type ElementRef, type TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CLOSE_REASON_PROGRAMMATIC,
  OVERLAY_SELECTOR_PANE,
  OverlayService,
  provideOverlayDefaults,
} from '@nexora-ui/overlay';
import { vi } from 'vitest';

import type { PopoverTriggerInput } from '../types/popover-trigger-types';

import { providePopoverDefaults } from './popover-defaults.config';
import { PopoverTriggerDirective } from './popover-trigger.directive';

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button
      [nxrPopover]="panelTpl"
      nxrPopoverPlacement="bottom"
      [nxrPopoverCloseAnimationDurationMs]="0"
      (nxrPopoverOpened)="onOpened()"
      (nxrPopoverClosed)="onClosed($event)"
    >
      Open
    </button>
    <ng-template #panelTpl>Panel content</ng-template>
  `,
})
class ClickHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
  @ViewChild(PopoverTriggerDirective) trigger!: PopoverTriggerDirective;
  openedCount = 0;
  lastCloseReason: string | null = null;

  onOpened(): void {
    this.openedCount++;
  }

  onClosed(reason: string): void {
    this.lastCloseReason = reason;
  }
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button
      [nxrPopover]="panelTpl"
      nxrPopoverTrigger="focus"
      nxrPopoverPlacement="bottom"
      [nxrPopoverCloseAnimationDurationMs]="0"
    >
      Focus me
    </button>
    <ng-template #panelTpl>Focus panel</ng-template>
  `,
})
class FocusTriggerHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button
      [nxrPopover]="panelTpl"
      [nxrPopoverTrigger]="['hover']"
      nxrPopoverPlacement="bottom"
      [nxrPopoverCloseAnimationDurationMs]="0"
      [nxrPopoverOpenDelay]="0"
      [nxrPopoverHoverCloseDelay]="0"
    >
      Hover me
    </button>
    <ng-template #panelTpl>Hover panel</ng-template>
  `,
})
class HoverTriggerHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button
      [nxrPopover]="panelTpl"
      nxrPopoverPlacement="bottom"
      [nxrPopoverHasBackdrop]="true"
      [nxrPopoverCloseAnimationDurationMs]="0"
    >
      Open with backdrop
    </button>
    <ng-template #panelTpl>Panel content</ng-template>
  `,
})
class BackdropHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  providers: [
    provideOverlayDefaults({
      classMergeMode: 'append',
      backdropClass: 'defaults-overlay-backdrop',
      nxrBackdropClass: 'defaults-overlay-nxr-backdrop',
    }),
    providePopoverDefaults({
      backdropClass: 'defaults-popover-backdrop',
    }),
  ],
  template: `
    <button
      [nxrPopover]="panelTpl"
      [nxrPopoverHasBackdrop]="true"
      nxrPopoverBackdropClass="instance-popover-backdrop"
      nxrBackdropClass="instance-nxr-backdrop"
      [nxrPopoverCloseAnimationDurationMs]="0"
    >
      Open with defaults precedence
    </button>
    <ng-template #panelTpl>Panel content</ng-template>
  `,
})
class BackdropDefaultsPrecedenceHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button [nxrPopover]="panelTpl" [nxrPopoverDisabled]="disabled()" nxrPopoverPlacement="bottom">
      Open
    </button>
    <ng-template #panelTpl>Panel</ng-template>
  `,
})
class DisabledHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
  disabled = signal(false);
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <div (click)="onParentClick()" (keydown.enter)="onParentClick()" tabindex="0">
      <button [nxrPopover]="panelTpl" nxrPopoverPlacement="bottom">Open</button>
    </div>
    <ng-template #panelTpl>Panel</ng-template>
  `,
})
class BubblingHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
  parentClicks = 0;

  onParentClick(): void {
    this.parentClicks += 1;
  }
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <a [nxrPopover]="panelTpl" href="#anchor-target" nxrPopoverPlacement="bottom"> Open </a>
    <ng-template #panelTpl>Panel</ng-template>
  `,
})
class AnchorHostComponent {
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button
      [nxrPopover]="panelTpl"
      [nxrPopoverAnchor]="externalAnchor"
      [nxrPopoverTrigger]="trigger()"
      [nxrPopoverOpenDelay]="0"
      [nxrPopoverHoverCloseDelay]="0"
      [nxrPopoverCloseAnimationDurationMs]="0"
    >
      Host
    </button>
    <button #external>External anchor</button>
    <ng-template #panelTpl>Panel</ng-template>
  `,
})
class ExternalAnchorDynamicTriggerHostComponent {
  @ViewChild('external', { static: true }) external!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
  readonly trigger = signal<PopoverTriggerInput>('click');

  get externalAnchor(): HTMLButtonElement | null {
    return this.external?.nativeElement ?? null;
  }
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button
      [nxrPopover]="panelTpl"
      [nxrPopoverAnchor]="activeAnchor()"
      [nxrPopoverTrigger]="['hover']"
      [nxrPopoverOpenDelay]="0"
      [nxrPopoverHoverCloseDelay]="0"
      [nxrPopoverCloseAnimationDurationMs]="0"
    >
      Host
    </button>
    <button #first>First</button>
    <button #second>Second</button>
    <ng-template #panelTpl>Panel</ng-template>
  `,
})
class ExternalAnchorSwitchHostComponent {
  @ViewChild('first', { static: true }) first!: ElementRef<HTMLButtonElement>;
  @ViewChild('second', { static: true }) second!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
  readonly activeAnchor = signal<HTMLElement | null>(null);
}

@Component({
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `
    <button
      [nxrPopover]="panelTpl"
      [nxrPopoverAnchor]="activeAnchor()"
      [nxrPopoverTrigger]="['hover']"
      [nxrPopoverOpenDelay]="0"
      [nxrPopoverHoverCloseDelay]="0"
      [nxrPopoverCloseAnimationDurationMs]="0"
      (nxrPopoverClosed)="onClosed()"
    >
      Host
    </button>
    <button #first>First</button>
    <button #second>Second</button>
    <ng-template #panelTpl>Panel</ng-template>
  `,
})
class ExternalAnchorSwitchWithCloseHandlerHostComponent {
  @ViewChild('first', { static: true }) first!: ElementRef<HTMLButtonElement>;
  @ViewChild('second', { static: true }) second!: ElementRef<HTMLButtonElement>;
  readonly activeAnchor = signal<HTMLElement | null>(null);
  closedCount = 0;

  onClosed(): void {
    this.closedCount += 1;
    this.activeAnchor.set(null);
  }
}

function getPane(): Element | null {
  return document.querySelector(OVERLAY_SELECTOR_PANE);
}

describe('PopoverTriggerDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ClickHostComponent,
        FocusTriggerHostComponent,
        HoverTriggerHostComponent,
        BackdropHostComponent,
        BackdropDefaultsPrecedenceHostComponent,
        DisabledHostComponent,
        BubblingHostComponent,
        AnchorHostComponent,
        ExternalAnchorDynamicTriggerHostComponent,
        ExternalAnchorSwitchHostComponent,
        ExternalAnchorSwitchWithCloseHandlerHostComponent,
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ClickHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn?.textContent?.trim()).toBe('Open');
  });

  it('should open overlay on trigger click', async () => {
    const fixture = TestBed.createComponent(ClickHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(getPane()).toBeNull();
    btn?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getPane()).not.toBeNull();
  });

  it('does not prevent default for click trigger events', async () => {
    const fixture = TestBed.createComponent(ClickHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    const notCanceled = btn.dispatchEvent(ev);
    await fixture.whenStable();

    expect(notCanceled).toBe(true);
    expect(ev.defaultPrevented).toBe(false);
    expect(getPane()).not.toBeNull();
  });

  it('allows click events to bubble to parent handlers', async () => {
    const fixture = TestBed.createComponent(BubblingHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(host.parentClicks).toBe(1);
    expect(getPane()).not.toBeNull();
  });

  it('keeps anchor click default behavior uncanceled', async () => {
    const fixture = TestBed.createComponent(AnchorHostComponent);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    const notCanceled = anchor.dispatchEvent(ev);
    await fixture.whenStable();

    expect(notCanceled).toBe(true);
    expect(ev.defaultPrevented).toBe(false);
    expect(getPane()).not.toBeNull();
  });

  it('rebinds external anchor listeners when trigger mode changes', async () => {
    const fixture = TestBed.createComponent(ExternalAnchorDynamicTriggerHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const anchor = host.externalAnchor as HTMLButtonElement;

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(getPane()).not.toBeNull();

    document
      .querySelector<HTMLElement>(OVERLAY_SELECTOR_PANE)
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(getPane()).toBeNull();

    host.trigger.set('hover');
    fixture.detectChanges();
    await fixture.whenStable();

    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getPane()).not.toBeNull();
  });

  it('reopens for hovered replacement external anchor without requiring leave/re-enter', async () => {
    const fixture = TestBed.createComponent(ExternalAnchorSwitchHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const first = host.first.nativeElement;
    const second = host.second.nativeElement;

    vi.spyOn(first, 'matches').mockImplementation((selector: string) =>
      selector === ':hover' ? true : Element.prototype.matches.call(first, selector),
    );
    vi.spyOn(second, 'matches').mockImplementation((selector: string) =>
      selector === ':hover' ? true : Element.prototype.matches.call(second, selector),
    );

    host.activeAnchor.set(first);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getPane()).not.toBeNull();

    host.activeAnchor.set(second);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => {
      const check = () => {
        if (second.getAttribute('aria-expanded') === 'true') {
          resolve();

          return;
        }
        setTimeout(check, 10);
      };

      check();
    });
    expect(second.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not emit closed while internally switching hovered external anchors', async () => {
    const fixture = TestBed.createComponent(ExternalAnchorSwitchWithCloseHandlerHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const first = host.first.nativeElement;
    const second = host.second.nativeElement;

    vi.spyOn(first, 'matches').mockImplementation((selector: string) =>
      selector === ':hover' ? true : Element.prototype.matches.call(first, selector),
    );
    vi.spyOn(second, 'matches').mockImplementation((selector: string) =>
      selector === ':hover' ? true : Element.prototype.matches.call(second, selector),
    );

    host.activeAnchor.set(first);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getPane()).not.toBeNull();

    host.activeAnchor.set(second);
    fixture.detectChanges();
    await fixture.whenStable();

    await new Promise<void>((resolve) => {
      const check = () => {
        if (second.getAttribute('aria-expanded') === 'true') {
          resolve();

          return;
        }
        setTimeout(check, 10);
      };

      check();
    });

    expect(host.closedCount).toBe(0);
    expect(second.getAttribute('aria-expanded')).toBe('true');
  });

  it('should emit nxrPopoverOpened when opened and nxrPopoverClosed when closed', async () => {
    const fixture = TestBed.createComponent(ClickHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const btn = fixture.nativeElement.querySelector('button');

    btn.click();
    await fixture.whenStable();
    expect(host.openedCount).toBe(1);
    expect(getPane()).not.toBeNull();

    host.trigger.close();
    await new Promise<void>((resolve) => {
      const check = () => (host.lastCloseReason != null ? resolve() : setTimeout(check, 20));
      check();
    });

    expect(host.lastCloseReason).toBe(CLOSE_REASON_PROGRAMMATIC);
  });

  it('should not open when nxrPopoverDisabled is true', async () => {
    const fixture = TestBed.createComponent(DisabledHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.disabled.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');

    btn.click();
    await fixture.whenStable();

    expect(getPane()).toBeNull();
  });

  it('should open on focus when trigger is focus', async () => {
    const fixture = TestBed.createComponent(FocusTriggerHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');

    expect(getPane()).toBeNull();
    btn.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getPane()).not.toBeNull();
  });

  it('should open on mouseenter when trigger is hover', async () => {
    const fixture = TestBed.createComponent(HoverTriggerHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');

    expect(getPane()).toBeNull();
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getPane()).not.toBeNull();
  });

  it('applies popover backdrop class when hasBackdrop is true', async () => {
    const fixture = TestBed.createComponent(BackdropHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');

    btn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const backdrop = document.querySelector('.nxr-popover-backdrop');
    expect(backdrop).not.toBeNull();
  });

  it('applies backdrop class precedence (overlay defaults < popover defaults < instance inputs)', async () => {
    const fixture = TestBed.createComponent(BackdropDefaultsPrecedenceHostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');

    btn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const backdrop = document.querySelector('.nxr-popover-backdrop') as HTMLElement | null;
    expect(backdrop).not.toBeNull();
    expect(backdrop?.classList.contains('defaults-popover-backdrop')).toBe(true);
    expect(backdrop?.classList.contains('instance-popover-backdrop')).toBe(true);
    expect(backdrop?.classList.contains('defaults-overlay-nxr-backdrop')).toBe(true);
    expect(backdrop?.classList.contains('instance-nxr-backdrop')).toBe(true);
  });

  it('disposes pending open ref when destroyed before attach resolves', async () => {
    const fixture = TestBed.createComponent(ClickHostComponent);
    fixture.detectChanges();
    const trigger = fixture.componentInstance.trigger;
    const overlay = TestBed.inject(OverlayService);

    let resolveAttach: (opened: boolean) => void = () => {};

    const attach = vi.fn().mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveAttach = resolve;
        }),
    );

    const dispose = vi.fn();
    const close = vi.fn();
    const afterClosed = vi.fn(() => ({ subscribe: vi.fn() }));
    vi.spyOn(overlay, 'create').mockReturnValueOnce({
      attach,
      dispose,
      close,
      afterClosed,
    } as never);

    trigger.open();
    fixture.destroy();
    resolveAttach(true);
    await Promise.resolve();

    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
