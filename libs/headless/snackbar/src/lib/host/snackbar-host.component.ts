import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { SNACKBAR_CONTENT_CONTEXT, SNACKBAR_CONTENT_TEMPLATE } from '../ref/snackbar-tokens';

/**
 * Host that renders the user's template inside the snackbar pane so the template
 * has access to the injector with SNACKBAR_REF (for nxrSnackbarClose, etc.).
 * Uses createEmbeddedView with the host injector so the template sees SNACKBAR_REF.
 * @internal
 */
@Component({
  selector: 'nxr-snackbar-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-container #hostContainer />',
})
export class SnackbarHostComponent implements AfterViewInit {
  @ViewChild('hostContainer', { read: ViewContainerRef })
  private readonly hostContainer!: ViewContainerRef;

  private readonly contentTemplate = inject(SNACKBAR_CONTENT_TEMPLATE);
  private readonly contentContext = inject(SNACKBAR_CONTENT_CONTEXT, { optional: true }) ?? {};
  private readonly injector = inject(Injector);

  ngAfterViewInit(): void {
    this.hostContainer.createEmbeddedView(this.contentTemplate, this.contentContext, {
      injector: this.injector,
    });
  }
}
