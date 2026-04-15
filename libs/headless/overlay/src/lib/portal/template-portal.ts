import { type TemplateRef, type ViewContainerRef } from '@angular/core';

import type { Portal } from './portal';

/**
 * Portal that attaches an ng-template to a host element.
 * Use ComponentPortal to attach a component instead.
 */
export class TemplatePortal implements Portal {
  private _attachedHost: HTMLElement | null = null;
  private _viewRef: ReturnType<ViewContainerRef['createEmbeddedView']> | null = null;

  constructor(
    private readonly template: TemplateRef<unknown>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly context?: unknown,
  ) {}

  get isAttached(): boolean {
    return this._attachedHost !== null;
  }

  attach(host: HTMLElement): void {
    if (this._attachedHost) {
      this.detach();
    }
    this._viewRef = this.viewContainerRef.createEmbeddedView(this.template, this.context);
    this._viewRef.detectChanges();

    const rootNodes = this._viewRef.rootNodes;

    for (const node of rootNodes) {
      // Angular root nodes can include Comment/Text/SVG nodes. Append nodes directly when possible
      // to avoid stringifying comments into "[object Comment]".
      if (node instanceof Node) {
        host.appendChild(node);
        continue;
      }
      host.appendChild(host.ownerDocument.createTextNode(String(node)));
    }

    this._attachedHost = host;
  }

  detach(): void {
    if (!this._viewRef || !this._attachedHost) return;

    const rootNodes = this._viewRef.rootNodes;

    for (const node of rootNodes) {
      if (node.parentNode === this._attachedHost) {
        this._attachedHost.removeChild(node);
      }
    }

    this._viewRef.destroy();
    this._viewRef = null;
    this._attachedHost = null;
  }
}
