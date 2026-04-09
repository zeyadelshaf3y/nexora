/**
 * Portal: content that can be attached to a host element.
 * Implementations: TemplatePortal, ComponentPortal.
 */

export interface Portal {
  readonly isAttached: boolean;
  attach(host: HTMLElement): void;
  detach(): void;
}
