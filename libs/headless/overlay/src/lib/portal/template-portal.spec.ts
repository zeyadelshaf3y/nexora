import { Component, inject, ViewChild, ViewContainerRef, type TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TemplatePortal } from './template-portal';

@Component({
  selector: 'nxr-template-portal-test-host',
  standalone: true,
  template: `
    <div #hostEl></div>
    <ng-template #tpl>
      @if (true) {
        <span>Hi</span>
      }
    </ng-template>
  `,
})
class HostComponent {
  readonly vcr = inject(ViewContainerRef);
  @ViewChild('tpl', { static: true }) tpl!: TemplateRef<unknown>;
  @ViewChild('hostEl', { static: true }) hostEl!: { nativeElement: HTMLElement };
}

describe('TemplatePortal', () => {
  it('attaches comment/text nodes without stringifying', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const portal = new TemplatePortal(fixture.componentInstance.tpl, fixture.componentInstance.vcr);
    const host = fixture.componentInstance.hostEl.nativeElement;
    portal.attach(host);

    expect(host.textContent).toContain('Hi');
    expect(host.textContent).not.toContain('[object Comment]');

    portal.detach();
  });
});
