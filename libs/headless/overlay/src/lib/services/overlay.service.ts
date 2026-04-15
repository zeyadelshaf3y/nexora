/**
 * @fileoverview Main overlay entry: create(config) and open(content, config).
 * Resolves portal (template/component), attaches via OverlayRefImpl, ensures global events (Escape/outside-click) are registered.
 */
import {
  createComponent,
  type ComponentRef,
  EnvironmentInjector,
  inject,
  Injectable,
  type TemplateRef,
  type Type,
  ViewContainerRef,
} from '@angular/core';

import { OverlayContainerService } from '../container/overlay-container.service';
import { DATA_ATTR_OVERLAY, OVERLAY_KIND_VIEW_HOST } from '../defaults/overlay-attributes';
import { OverlayEventsService } from '../events';
import { ComponentPortal } from '../portal/component-portal';
import type { TemplatePortal } from '../portal/template-portal';
import { OverlayRefImpl } from '../ref';
import type { OverlayConfig } from '../ref/overlay-config';
import type { OverlayRef } from '../ref/overlay-ref';
import { OverlayStackService } from '../stack/overlay-stack.service';
import type { ContentOpenOptionsBase, OpenInputs, OpenOutputs } from '../types/open-types';
import {
  applyComponentInputs,
  isComponent,
  subscribeComponentOutputs,
  unsubscribeComponentOutputSubscriptions,
} from '../utils/apply-component-bindings';
import { resolveViewContainerRefFromExplicitOptions } from '../utils/resolve-view-container-ref';
import { subscribeOnceAfterClosed } from '../utils/subscribe-once-after-closed';
import { OverlayViewHostComponent } from '../view-host/overlay-view-host.component';

import { createOverlayOpenPortal } from './create-overlay-open-portal';

/** Config for OverlayService.open(): overlay behavior + content (VCR, injector, inputs, outputs). */
export type OverlayOpenConfig = OverlayConfig &
  ContentOpenOptionsBase & {
    inputs?: OpenInputs;
    outputs?: OpenOutputs;
  };

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private readonly stack = inject(OverlayStackService);
  private readonly container = inject(OverlayContainerService);
  private readonly events = inject(OverlayEventsService);
  private readonly envInjector = inject(EnvironmentInjector);

  /** User-provided default (e.g. via setDefaultViewContainerRef); takes precedence over lazy host. */
  private defaultViewContainerRef: ViewContainerRef | null = null;
  /** Lazy-created internal host; provides a VCR when no default is set. */
  private viewHostRef: ComponentRef<OverlayViewHostComponent> | null = null;

  private ensureGlobalEventsInitialized(): void {
    // Accessing injected service ensures listeners are registered.
    void this.events;
  }

  /**
   * Sets the default ViewContainerRef for open(). Optional: use when you need overlay content
   * created in a specific injector hierarchy. If not set, an internal host is used automatically.
   */
  setDefaultViewContainerRef(vcr: ViewContainerRef | null): void {
    this.defaultViewContainerRef = vcr;
  }

  /** Default ViewContainerRef: user-set or lazy-created internal host. */
  getDefaultViewContainerRef(): ViewContainerRef | null {
    return this.defaultViewContainerRef ?? this.getOrCreateLazyViewContainerRef();
  }

  /**
   * Resolves ViewContainerRef from config: explicit viewContainerRef, injector, default, or lazy host.
   */
  private resolveViewContainerRef(config: OverlayOpenConfig): ViewContainerRef | null {
    const injector =
      config.injector && typeof config.injector !== 'function' ? config.injector : null;

    return resolveViewContainerRefFromExplicitOptions(
      { viewContainerRef: config.viewContainerRef, injector },
      () => this.defaultViewContainerRef ?? this.getOrCreateLazyViewContainerRef(),
    );
  }

  /**
   * Creates an internal host component attached to the overlay container and returns its ViewContainerRef.
   * Used when open() is called without viewContainerRef and without a default set.
   */
  private getOrCreateLazyViewContainerRef(): ViewContainerRef | null {
    if (this.viewHostRef) {
      return this.viewHostRef.injector.get(ViewContainerRef);
    }

    try {
      const containerEl = this.container.getContainer();
      const hostEl = containerEl.ownerDocument.createElement('div');

      hostEl.setAttribute(DATA_ATTR_OVERLAY, OVERLAY_KIND_VIEW_HOST);
      containerEl.appendChild(hostEl);

      this.viewHostRef = createComponent(OverlayViewHostComponent, {
        hostElement: hostEl,
        environmentInjector: this.envInjector,
      });

      return this.viewHostRef.injector.get(ViewContainerRef);
    } catch {
      return null;
    }
  }

  /** Creates an overlay ref with the given config. Attach a portal yourself for full control. */
  create(config: OverlayConfig): OverlayRef {
    this.ensureGlobalEventsInitialized();

    return new OverlayRefImpl(config, this.stack, this.container);
  }

  /**
   * Opens an overlay with the given content and config. You supply position strategy,
   * scroll strategy, and all overlay options. Returns the ref or null if beforeOpen prevented open.
   *
   * @throws Error if a ViewContainerRef cannot be obtained (pass viewContainerRef, an injector that provides it, or ensure DOM is available).
   */
  async open<T>(
    content: Type<T>,
    config: OverlayOpenConfig & { inputs?: OpenInputs; outputs?: OpenOutputs },
  ): Promise<OverlayRef | null>;
  async open(content: TemplateRef<unknown>, config: OverlayOpenConfig): Promise<OverlayRef | null>;
  async open(
    content: TemplateRef<unknown> | Type<unknown>,
    config: OverlayOpenConfig,
  ): Promise<OverlayRef | null> {
    this.ensureGlobalEventsInitialized();

    const vcr = this.resolveViewContainerRef(config);
    if (!vcr) {
      throw new Error(
        'OverlayService.open(): could not obtain a ViewContainerRef. Pass viewContainerRef in config, pass an injector that provides ViewContainerRef, or ensure the overlay container can be created (DOM available).',
      );
    }

    const ref = this.create(config);

    const portal = createOverlayOpenPortal(content, vcr, config.injector, ref);

    const opened = await ref.attach(portal);

    if (!opened) {
      ref.dispose();

      return null;
    }

    this.bindComponentIO(ref, portal, content, config);

    return ref;
  }

  private bindComponentIO(
    ref: OverlayRef,
    portal: ComponentPortal<unknown> | TemplatePortal,
    content: TemplateRef<unknown> | Type<unknown>,
    config: OverlayOpenConfig,
  ): void {
    if (!(portal instanceof ComponentPortal) || !portal.componentRef) return;

    const compRef = portal.componentRef;
    if (config.inputs) {
      applyComponentInputs(compRef, config.inputs);
    }
    if (!config.outputs || !isComponent(content)) return;

    const subs = subscribeComponentOutputs(compRef, content, config.outputs);
    if (subs.length === 0) return;

    subscribeOnceAfterClosed(ref, () => unsubscribeComponentOutputSubscriptions(subs));
  }
}
