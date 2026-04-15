import { Component, type TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SNACKBAR_CONTENT_CONTEXT, SNACKBAR_CONTENT_TEMPLATE } from '../ref/snackbar-tokens';

import { SnackbarHostComponent } from './snackbar-host.component';

@Component({
  standalone: true,
  template: '<ng-template #tpl><span class="snack-content">Hello</span></ng-template>',
})
class TplProviderComponent {
  @ViewChild('tpl') templateRef!: TemplateRef<unknown>;
}

describe('SnackbarHostComponent', () => {
  it('should create and render container when template and context are provided', () => {
    const tplFixture = TestBed.createComponent(TplProviderComponent);
    tplFixture.detectChanges();
    const realTpl = tplFixture.componentInstance.templateRef;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SnackbarHostComponent],
      providers: [
        { provide: SNACKBAR_CONTENT_TEMPLATE, useValue: realTpl },
        { provide: SNACKBAR_CONTENT_CONTEXT, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(SnackbarHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement).toBeTruthy();
  });
});
