import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OVERLAY_SELECTOR_PANE } from '@nexora-ui/overlay';

import { TOOLTIP_DEFAULTS_CONFIG } from './tooltip-defaults.config';
import { TooltipTriggerDirective } from './tooltip-trigger.directive';

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button
    nxrTooltip="Hello tooltip"
    [nxrTooltipOpenDelay]="0"
    [nxrTooltipHoverCloseDelay]="0"
  >
    Hover me
  </button>`,
})
class InstantHost {
  readonly _brand = 'InstantHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button nxrTooltip="Delayed" [nxrTooltipOpenDelay]="200">Hover me</button>`,
})
class DelayedHost {
  readonly _brand = 'DelayedHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button nxrTooltip="Disabled" [nxrTooltipDisabled]="true" [nxrTooltipOpenDelay]="0">
    Hover me
  </button>`,
})
class DisabledHost {
  readonly _brand = 'DisabledHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button
    nxrTooltip="Content hover"
    [nxrTooltipAllowContentHover]="true"
    [nxrTooltipOpenDelay]="0"
    [nxrTooltipHoverCloseDelay]="0"
  >
    Hover me
  </button>`,
})
class AllowContentHoverHost {
  readonly _brand = 'AllowContentHoverHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `
    <button nxrTooltip="First" [nxrTooltipOpenDelay]="200" [nxrTooltipHoverCloseDelay]="0">
      First
    </button>
    <button nxrTooltip="Second" [nxrTooltipOpenDelay]="200" [nxrTooltipHoverCloseDelay]="0">
      Second
    </button>
  `,
})
class TwoTooltipsHost {
  readonly _brand = 'TwoTooltipsHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `
    <button
      nxrTooltip="First slow close"
      [nxrTooltipOpenDelay]="200"
      [nxrTooltipHoverCloseDelay]="400"
      [nxrTooltipCloseAnimationDurationMs]="200"
    >
      First
    </button>
    <button
      nxrTooltip="Second instant handoff"
      [nxrTooltipOpenDelay]="200"
      [nxrTooltipHoverCloseDelay]="0"
      [nxrTooltipCloseAnimationDurationMs]="200"
    >
      Second
    </button>
  `,
})
class HandoffTooltipsHost {
  readonly _brand = 'HandoffTooltipsHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `
    <button
      nxrTooltip="First"
      [nxrTooltipOpenDelay]="200"
      [nxrTooltipHoverCloseDelay]="300"
      [nxrTooltipCloseAnimationDurationMs]="200"
    >
      First
    </button>
    <button
      nxrTooltip="Second with delayed close"
      [nxrTooltipOpenDelay]="200"
      [nxrTooltipHoverCloseDelay]="150"
      [nxrTooltipCloseAnimationDurationMs]="200"
    >
      Second
    </button>
  `,
})
class HandoffThenLeaveHost {
  readonly _brand = 'HandoffThenLeaveHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `
    <button
      nxrTooltip="First"
      [nxrTooltipOpenDelay]="200"
      [nxrTooltipHoverCloseDelay]="400"
      [nxrTooltipCloseAnimationDurationMs]="200"
      [nxrTooltipInstantOnHandoff]="false"
    >
      First
    </button>
    <button
      nxrTooltip="Second"
      [nxrTooltipOpenDelay]="200"
      [nxrTooltipHoverCloseDelay]="0"
      [nxrTooltipCloseAnimationDurationMs]="200"
      [nxrTooltipInstantOnHandoff]="false"
    >
      Second
    </button>
  `,
})
class NoInstantHandoffHost {
  readonly _brand = 'NoInstantHandoffHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button
    nxrTooltip="Re-enter delayed"
    [nxrTooltipOpenDelay]="200"
    [nxrTooltipHoverCloseDelay]="0"
    [nxrTooltipCloseAnimationDurationMs]="0"
  >
    Hover me
  </button>`,
})
class ReenterDelayHost {
  readonly _brand = 'ReenterDelayHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button
    nxrTooltip="Close delay"
    [nxrTooltipOpenDelay]="0"
    [nxrTooltipHoverCloseDelay]="150"
  >
    Hover me
  </button>`,
})
class CloseDelayHost {
  readonly _brand = 'CloseDelayHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button nxrTooltip="Configured defaults">Hover me</button>`,
})
class ProviderDefaultsHost {
  readonly _brand = 'ProviderDefaultsHost';
}

@Component({
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `
    <button nxrTooltip="First">First</button>
    <button nxrTooltip="Second">Second</button>
  `,
})
class ProviderNoInstantHandoffHost {
  readonly _brand = 'ProviderNoInstantHandoffHost';
}

function flush(ms = 50): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

describe('TooltipTriggerDirective', () => {
  function getPane(): HTMLElement | null {
    return document.querySelector(OVERLAY_SELECTOR_PANE);
  }

  afterEach(async () => {
    document.querySelectorAll('[data-nxr-overlay="container"]').forEach((el) => {
      el.innerHTML = '';
    });
    await flush(10);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InstantHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('opens tooltip on mouseenter', async () => {
    const fixture = TestBed.createComponent(InstantHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();

    const pane = getPane();
    expect(pane).not.toBeNull();
    expect(pane?.textContent).toContain('Hello tooltip');
  });

  it('opens tooltip on focus', async () => {
    const fixture = TestBed.createComponent(InstantHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await flush();

    expect(getPane()).not.toBeNull();
  });

  it('sets role=tooltip and aria-describedby', async () => {
    const fixture = TestBed.createComponent(InstantHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();

    const pane = getPane();
    expect(pane).not.toBeNull();
    expect(pane?.getAttribute('role')).toBe('tooltip');
    expect(btn.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('renders arrow by default', async () => {
    const fixture = TestBed.createComponent(InstantHost);
    fixture.autoDetectChanges();

    fixture.nativeElement
      .querySelector('button')
      .dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();

    expect(document.querySelector('.nxr-tooltip-arrow')).not.toBeNull();
  });

  it('does not open when disabled', async () => {
    const fixture = TestBed.createComponent(DisabledHost);
    fixture.autoDetectChanges();

    fixture.nativeElement
      .querySelector('button')
      .dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();

    expect(getPane()).toBeNull();
  });

  it('does not open immediately when delay > 0', async () => {
    const fixture = TestBed.createComponent(DelayedHost);
    fixture.autoDetectChanges();

    fixture.nativeElement
      .querySelector('button')
      .dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(10);

    expect(getPane()).toBeNull();
  });

  it('closes on mouseleave', async () => {
    const fixture = TestBed.createComponent(InstantHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();
    expect(getPane()).not.toBeNull();

    btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await flush(200);

    expect(getPane()?.parentElement).toBeFalsy();
  });

  it('closes on blur', async () => {
    const fixture = TestBed.createComponent(InstantHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await flush();
    expect(getPane()).not.toBeNull();

    btn.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await flush(200);

    expect(getPane()?.parentElement).toBeFalsy();
  });

  it('keeps tooltip open when allowContentHover is true and cursor moves to pane', async () => {
    const fixture = TestBed.createComponent(AllowContentHoverHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();
    const pane = getPane();
    expect(pane).not.toBeNull();

    const doc = btn.ownerDocument ?? document;
    const orig = (doc as Document & { elementFromPoint?(x: number, y: number): Element | null })
      .elementFromPoint;
    (
      doc as Document & { elementFromPoint: (x: number, y: number) => Element | null }
    ).elementFromPoint = () => pane;

    btn.dispatchEvent(
      new MouseEvent('mouseleave', {
        bubbles: true,
        relatedTarget: pane ?? undefined,
        clientX: 10,
        clientY: 10,
      }),
    );
    await flush(50);
    expect(getPane()).not.toBeNull();

    if (orig != null) (doc as Document & { elementFromPoint: typeof orig }).elementFromPoint = orig;
  });

  it('respects open delay when switching after first tooltip fully closes', async () => {
    const fixture = TestBed.createComponent(TwoTooltipsHost);
    fixture.autoDetectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const first = buttons[0] as HTMLButtonElement;
    const second = buttons[1] as HTMLButtonElement;

    first.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(250);
    expect(getPane()?.textContent).toContain('First');

    first.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await flush(350);

    second.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(30);
    expect(getPane()).toBeNull();

    await flush(230);
    expect(getPane()?.textContent).toContain('Second');
  });

  it('respects hover close delay before closing', async () => {
    const fixture = TestBed.createComponent(CloseDelayHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();
    expect(getPane()).not.toBeNull();

    btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await flush(50);
    expect(getPane()).not.toBeNull();

    await flush(400);
    expect(getPane()?.parentElement).toBeFalsy();
  });

  it('switches to the next tooltip instantly during handoff', async () => {
    const fixture = TestBed.createComponent(HandoffTooltipsHost);
    fixture.autoDetectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const first = buttons[0] as HTMLButtonElement;
    const second = buttons[1] as HTMLButtonElement;

    first.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(260);
    expect(getPane()?.textContent).toContain('First slow close');

    first.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    second.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(30);

    const pane = getPane();
    expect(pane?.textContent).toContain('Second instant handoff');
    expect(document.querySelectorAll(OVERLAY_SELECTOR_PANE).length).toBe(1);
  });

  it('keeps open delay when leaving tooltip completely and re-entering', async () => {
    const fixture = TestBed.createComponent(ReenterDelayHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(250);
    expect(getPane()?.textContent).toContain('Re-enter delayed');

    btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await flush(30);
    expect(getPane()).toBeNull();

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(30);
    expect(getPane()).toBeNull();

    await flush(230);
    expect(getPane()?.textContent).toContain('Re-enter delayed');
  });

  it('does not skip close delay/animation when leaving a handoff-opened tooltip', async () => {
    const fixture = TestBed.createComponent(HandoffThenLeaveHost);
    fixture.autoDetectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const first = buttons[0] as HTMLButtonElement;
    const second = buttons[1] as HTMLButtonElement;

    first.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(260);
    expect(getPane()?.textContent).toContain('First');

    first.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    second.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(30);
    expect(getPane()?.textContent).toContain('Second with delayed close');

    second.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await flush(60);
    expect(getPane()).not.toBeNull();

    await flush(500);
    expect(getPane()?.parentElement).toBeFalsy();
  });

  it('uses provider defaults when input is not explicitly set', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: TOOLTIP_DEFAULTS_CONFIG, useValue: { openDelay: 0, displayArrow: false } },
      ],
    });

    const fixture = TestBed.createComponent(ProviderDefaultsHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(30);

    expect(getPane()?.textContent).toContain('Configured defaults');
    expect(document.querySelector('.nxr-tooltip-arrow')).toBeNull();
  });

  it('does not instant handoff when nxrTooltipInstantOnHandoff is false', async () => {
    const fixture = TestBed.createComponent(NoInstantHandoffHost);
    fixture.autoDetectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const first = buttons[0] as HTMLButtonElement;
    const second = buttons[1] as HTMLButtonElement;

    first.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(260);
    expect(getPane()?.textContent).toContain('First');

    first.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    second.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(30);
    expect(getPane()?.textContent).toContain('First');
  });

  it('respects provider default for instantOnHandoff=false', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: TOOLTIP_DEFAULTS_CONFIG, useValue: { instantOnHandoff: false } }],
    });

    const fixture = TestBed.createComponent(ProviderNoInstantHandoffHost);
    fixture.autoDetectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const first = buttons[0] as HTMLButtonElement;
    const second = buttons[1] as HTMLButtonElement;

    first.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(230);
    expect(getPane()?.textContent).toContain('First');

    first.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    second.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(30);
    expect(getPane()?.textContent).toContain('First');
  });

  it('applies provider defaults for panelClass, panelStyle, and arrowSize', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TOOLTIP_DEFAULTS_CONFIG,
          useValue: {
            openDelay: 0,
            panelClass: 'provider-tooltip-pane',
            panelStyle: { maxWidth: '22rem' },
            arrowSize: { width: 20, height: 10 },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProviderDefaultsHost);
    fixture.autoDetectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush(40);

    const pane = getPane();
    expect(pane).not.toBeNull();
    expect(pane?.classList.contains('provider-tooltip-pane')).toBe(true);
    expect(pane?.style.maxWidth).toBe('22rem');
    expect(pane?.style.getPropertyValue('--nxr-arrow-width')).toBe('20px');
    expect(pane?.style.getPropertyValue('--nxr-arrow-height')).toBe('10px');
  });
});
