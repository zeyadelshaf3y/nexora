import { Injector, type TemplateRef, type Type, type ViewContainerRef } from '@angular/core';
import { ComponentPortal, isComponent } from '@nexora-ui/overlay';
import type { Observable } from 'rxjs';

import { SnackbarHostComponent } from '../../host/snackbar-host.component';
import type { SnackbarOpenOptions } from '../../options/snackbar-open-options';
import {
  SNACKBAR_CONTENT_CONTEXT,
  SNACKBAR_CONTENT_TEMPLATE,
  SNACKBAR_REF,
} from '../../ref/snackbar-tokens';

/**
 * Minimal ref shape used by the stack registry, {@link SNACKBAR_REF}, and attach pipeline.
 * Keeps snackbar service maps type-erased without pulling in `SnackbarRefImpl` generics.
 */
export type SnackbarInternalRef = {
  close(): void;
  reposition(): void;
  afterClosed(): Observable<unknown>;
  getPaneElement(): HTMLElement | null;
};

/** Non-modal snackbar pane: no outside/Escape/backdrop close (handled by service / consumer). */
export const SNACKBAR_OVERLAY_CLOSE_POLICY = {
  outside: 'none',
  escape: 'none',
  backdrop: 'none',
} as const;

export function createSnackbarOpenInjector(
  content: TemplateRef<unknown> | Type<unknown>,
  options: SnackbarOpenOptions,
  snackbarRef: SnackbarInternalRef,
): Injector {
  return Injector.create({
    providers: [
      { provide: SNACKBAR_REF, useValue: snackbarRef },
      ...(isComponent(content)
        ? []
        : [
            { provide: SNACKBAR_CONTENT_TEMPLATE, useValue: content },
            { provide: SNACKBAR_CONTENT_CONTEXT, useValue: options.data ?? {} },
          ]),
    ],
    parent: options.injector,
  });
}

export function createSnackbarContentPortal(
  content: TemplateRef<unknown> | Type<unknown>,
  vcr: ViewContainerRef,
  injector: Injector,
): ComponentPortal<unknown> {
  return isComponent(content)
    ? new ComponentPortal(content, vcr, injector)
    : new ComponentPortal(SnackbarHostComponent, vcr, injector);
}
