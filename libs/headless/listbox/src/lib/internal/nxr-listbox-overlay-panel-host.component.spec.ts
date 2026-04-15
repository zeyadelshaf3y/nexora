import { Component, type TemplateRef, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  NXR_LISTBOX_OVERLAY_PANEL_CONTEXT,
  type NxrListboxOverlayPanelContext,
} from './nxr-listbox-overlay-panel-context';
import { NxrListboxOverlayPanelHostComponent } from './nxr-listbox-overlay-panel-host.component';

function makeContext(
  tpl: TemplateRef<unknown>,
  childOwnsScroll: boolean,
): NxrListboxOverlayPanelContext {
  return {
    template: tpl,
    childOwnsScroll,
    value: signal(null),
    multi: signal(false),
    accessors: signal(undefined),
    compareWith: signal(undefined),
    initialHighlight: signal('none'),
    onValueChange: () => {},
    onListboxReady: () => {},
  };
}

@Component({
  standalone: true,
  imports: [NxrListboxOverlayPanelHostComponent],
  template: `
    <ng-template #tpl><span data-test="panel-slot">slot</span></ng-template>
    <nxr-listbox-overlay-panel-host />
  `,
  providers: [
    {
      provide: NXR_LISTBOX_OVERLAY_PANEL_CONTEXT,
      deps: [PanelHostListboxScrollsParent],
      useFactory: (p: PanelHostListboxScrollsParent): NxrListboxOverlayPanelContext =>
        makeContext(p.tpl, false),
    },
  ],
})
class PanelHostListboxScrollsParent {
  @ViewChild('tpl', { static: true }) tpl!: TemplateRef<unknown>;
}

@Component({
  standalone: true,
  imports: [NxrListboxOverlayPanelHostComponent],
  template: `
    <ng-template #tpl><span data-test="panel-slot">slot</span></ng-template>
    <nxr-listbox-overlay-panel-host />
  `,
  providers: [
    {
      provide: NXR_LISTBOX_OVERLAY_PANEL_CONTEXT,
      deps: [PanelHostChildScrollParent],
      useFactory: (p: PanelHostChildScrollParent): NxrListboxOverlayPanelContext =>
        makeContext(p.tpl, true),
    },
  ],
})
class PanelHostChildScrollParent {
  @ViewChild('tpl', { static: true }) tpl!: TemplateRef<unknown>;
}

describe('NxrListboxOverlayPanelHostComponent', () => {
  it('sets overflow auto on the listbox host when childOwnsScroll is false', () => {
    TestBed.configureTestingModule({ imports: [PanelHostListboxScrollsParent] });
    const fixture = TestBed.createComponent(PanelHostListboxScrollsParent);
    fixture.detectChanges();

    const listbox = fixture.debugElement.query(By.css('[role="listbox"]'))
      .nativeElement as HTMLElement;
    expect(listbox.style.overflow).toBe('auto');
  });

  it('sets overflow hidden on the listbox when childOwnsScroll is true', () => {
    TestBed.configureTestingModule({ imports: [PanelHostChildScrollParent] });
    const fixture = TestBed.createComponent(PanelHostChildScrollParent);
    fixture.detectChanges();

    const listbox = fixture.debugElement.query(By.css('[role="listbox"]'))
      .nativeElement as HTMLElement;

    expect(listbox.style.overflow).toBe('hidden');
  });

  it('adds child-scroll layout classes when childOwnsScroll is true', () => {
    TestBed.configureTestingModule({ imports: [PanelHostChildScrollParent] });
    const fixture = TestBed.createComponent(PanelHostChildScrollParent);
    fixture.detectChanges();

    const host = fixture.debugElement.query(By.css('nxr-listbox-overlay-panel-host'))
      .nativeElement as HTMLElement;
    const listbox = fixture.debugElement.query(By.css('[role="listbox"]'))
      .nativeElement as HTMLElement;

    expect(host.classList.contains('nxr-listbox-overlay-panel-host--child-scroll')).toBe(true);
    expect(
      listbox.classList.contains('nxr-listbox-overlay-panel-host__listbox--child-scroll'),
    ).toBe(true);
  });
});
