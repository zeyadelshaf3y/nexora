import { Injectable } from '@angular/core';
import { ownerDocument } from '@nexora-ui/core';

import {
  DATA_ATTR_OVERLAY,
  DATA_ATTR_SCOPE,
  DATA_ATTR_STATE,
  OVERLAY_KIND_BACKDROP,
  OVERLAY_KIND_CONTAINER,
  OVERLAY_KIND_PANE,
  OVERLAY_STATE_OPEN,
} from '../defaults/overlay-attributes';

/** Result of creating overlay pane and optional backdrop. */
export interface PaneElementResult {
  readonly pane: HTMLElement;
  readonly backdrop: HTMLElement | null;
}

/** Single global overlay container under body. Pane/backdrop slots created per overlay. */
@Injectable({ providedIn: 'root' })
export class OverlayContainerService {
  private container: HTMLElement | null = null;

  /**
   * Returns the global overlay container, creating and appending it to document.body if needed.
   * If document has no body yet (e.g. during parsing), the container is created but not appended.
   */
  getContainer(): HTMLElement {
    if (!this.container) {
      const doc = ownerDocument();

      if (!doc) throw new Error('OverlayContainerService requires DOM (document)');

      this.container = doc.createElement('div');

      this.container.setAttribute(DATA_ATTR_OVERLAY, OVERLAY_KIND_CONTAINER);

      if (doc.body) {
        doc.body.appendChild(this.container);
      }
    }

    return this.container;
  }

  /**
   * Creates a bare pane element (and optional backdrop) for an overlay.
   * Only positional base styles are applied here. All sizing, overflow, and
   * visual styles are applied later by {@link OverlayRefImpl.stylePaneAndBackdrop}.
   */
  createPaneElement(scopeId: string, hasBackdrop: boolean): PaneElementResult {
    const host = this.getContainer();
    const doc = host.ownerDocument;
    const pane = doc.createElement('div');

    this.setOverlayAttributes({ el: pane, kind: OVERLAY_KIND_PANE, scopeId });

    Object.assign(pane.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      boxSizing: 'border-box',
    });

    const backdrop = hasBackdrop ? this.createBackdrop(doc, scopeId) : null;

    return { pane, backdrop };
  }

  private setOverlayAttributes({
    el,
    kind,
    scopeId,
  }: {
    readonly el: HTMLElement;
    readonly kind: string;
    readonly scopeId: string;
  }): void {
    el.setAttribute(DATA_ATTR_OVERLAY, kind);
    el.setAttribute(DATA_ATTR_STATE, OVERLAY_STATE_OPEN);
    el.setAttribute(DATA_ATTR_SCOPE, scopeId);
  }

  private createBackdrop(doc: Document, scopeId: string): HTMLElement {
    const backdrop = doc.createElement('div');

    this.setOverlayAttributes({ el: backdrop, kind: OVERLAY_KIND_BACKDROP, scopeId });

    Object.assign(backdrop.style, {
      position: 'fixed',
      inset: '0',
    });

    return backdrop;
  }
}
