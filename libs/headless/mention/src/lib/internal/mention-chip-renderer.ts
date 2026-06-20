/**
 * Hydrates mention chip spans with custom Angular templates.
 *
 * The adapter creates framework-agnostic chip spans (canonical text + data attributes). This
 * renderer watches the editable root and, for each chip, instantiates the matching
 * `ng-template[nxrMentionChip]` (per-trigger override, else the default) as an embedded view and
 * moves the rendered nodes inside the chip span. Views are destroyed when chips are removed and on
 * teardown so there are no leaks.
 *
 * Design notes:
 * - The chip span (mention boundary + canonical `data-mention-text`) is never replaced, only its
 *   inner DOM. All logical-text readers use `data-mention-text`, so rich inner markup is safe.
 * - A `MutationObserver` is the single hydrate/destroy trigger, covering select, programmatic
 *   insert, restore (`setDocument`), and paste uniformly without threading hooks everywhere.
 * - Idempotency is tracked by the live view map (no DOM marker), so nothing leaks into the
 *   serialized document and restore stays correct.
 * - Plain typing is cheap: text-node mutations carry no chip elements, so no scan happens.
 * - Chip moves (line merges relocate a chip via `appendChild`) keep their view: a view is destroyed
 *   only when its chip is genuinely detached from the editor, never when it is merely relocated.
 * - Views are created inside the Angular zone so event handlers in a chip template trigger change
 *   detection as usual.
 */

import type { EmbeddedViewRef, NgZone, TemplateRef, ViewContainerRef } from '@angular/core';

import {
  ATTR_CONTENTEDITABLE,
  ATTR_MENTION_DATA,
  ATTR_MENTION_ID,
  ATTR_MENTION_LABEL,
  ATTR_MENTION_TEXT,
  ATTR_MENTION_TRIGGER,
  readMentionData,
  readMentionLogicalText,
} from '../adapters/internal/contenteditable-dom-constants';
import type { MentionChipContext, MentionEntity } from '../types/mention-types';

const CHIP_SELECTOR = `[${ATTR_MENTION_ID}]`;

/** Attribute names that are internal plumbing and excluded from the entity `attributes` map. */
const INTERNAL_CHIP_ATTRS = new Set<string>([
  ATTR_MENTION_ID,
  ATTR_MENTION_LABEL,
  ATTR_MENTION_TEXT,
  ATTR_MENTION_DATA,
  ATTR_CONTENTEDITABLE,
  'spellcheck',
]);

export type MentionChipTemplateResolver = () => ReadonlyMap<
  string,
  TemplateRef<MentionChipContext>
>;

/** A hydrated chip view plus the template it was rendered from (to detect template changes). */
interface ChipView {
  readonly view: EmbeddedViewRef<MentionChipContext>;
  readonly template: TemplateRef<MentionChipContext>;
}

export class MentionChipRenderer {
  private observer: MutationObserver | null = null;
  private readonly views = new Map<HTMLElement, ChipView>();

  constructor(
    private readonly root: HTMLElement,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly ngZone: NgZone,
    private readonly resolveTemplates: MentionChipTemplateResolver,
  ) {}

  attach(): void {
    if (this.observer) return;

    // Hydrate any chips already present (e.g. an initial document applied before attach).
    this.hydrateChips(this.collectUnhydratedChips(this.root));

    this.observer = new MutationObserver((records) => this.onMutations(records));
    this.observer.observe(this.root, { childList: true, subtree: true });
  }

  /** Re-scan the root after a programmatic document apply: prune removed chips, hydrate new ones. */
  refresh(): void {
    if (!this.observer) return;

    this.pruneDetachedViews();
    this.hydrateChips(this.collectUnhydratedChips(this.root));
  }

  /** Rebuilds one hydrated chip view after programmatic attribute changes (always re-renders). */
  refreshChip(chip: HTMLElement): void {
    if (!this.observer || !this.root.contains(chip)) return;

    const templates = this.resolveTemplates();
    this.ngZone.run(() => this.rebuildChip(chip, templates, true));
  }

  /**
   * Re-resolves templates for every chip currently in the editor. Use when the set of
   * `ng-template[nxrMentionChip]` directives or their trigger inputs change, so already-rendered
   * chips pick up the new (or removed) template. Chips whose resolved template did not change keep
   * their existing view (and DOM node identity) untouched.
   */
  refreshAll(): void {
    if (!this.observer) return;

    const templates = this.resolveTemplates();
    this.ngZone.run(() => {
      for (const chip of this.collectAllChips(this.root)) {
        this.rebuildChip(chip, templates, false);
      }
    });
  }

  dispose(): void {
    this.observer?.disconnect();
    this.observer = null;

    for (const { view } of this.views.values()) {
      view.destroy();
    }

    this.views.clear();
  }

  private onMutations(records: MutationRecord[]): void {
    // Destroy views for chips that left the editor (deletes, line removals, setDocument).
    for (const record of records) {
      for (const node of Array.from(record.removedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) this.destroyDetachedWithin(node as Element);
      }
    }

    // Hydrate chips that entered the editor, scanning only the added subtrees (not the whole root).
    const pending = new Set<HTMLElement>();

    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        for (const chip of this.collectUnhydratedChips(node as Element)) {
          pending.add(chip);
        }
      }
    }

    if (pending.size > 0) this.hydrateChips([...pending]);
  }

  private collectUnhydratedChips(scope: Element): HTMLElement[] {
    const chips: HTMLElement[] = [];

    if (scope.matches(CHIP_SELECTOR) && !this.views.has(scope as HTMLElement)) {
      chips.push(scope as HTMLElement);
    }

    scope.querySelectorAll<HTMLElement>(CHIP_SELECTOR).forEach((chip) => {
      if (!this.views.has(chip)) chips.push(chip);
    });

    return chips;
  }

  private collectAllChips(scope: Element): HTMLElement[] {
    const chips: HTMLElement[] = [];

    if (scope.matches(CHIP_SELECTOR)) chips.push(scope as HTMLElement);

    scope.querySelectorAll<HTMLElement>(CHIP_SELECTOR).forEach((chip) => chips.push(chip));

    return chips;
  }

  /**
   * Re-renders `chip` from the current templates. When `force` is false and the resolved template
   * is unchanged, the existing view (and its DOM nodes) is kept as-is so node identity is stable.
   * When no template matches (e.g. a chip template was removed), restores the canonical plain-text
   * fallback from `data-mention-text` so the chip is never left empty.
   */
  private rebuildChip(
    chip: HTMLElement,
    templates: ReadonlyMap<string, TemplateRef<MentionChipContext>>,
    force: boolean,
  ): void {
    const trigger = chip.getAttribute(ATTR_MENTION_TRIGGER) ?? '';
    const template = templates.get(trigger) ?? templates.get('');
    const existing = this.views.get(chip);

    if (!force && (existing?.template ?? undefined) === template) {
      // Nothing changed for this chip. Ensure a chip with no template still shows its fallback text.
      if (!existing && !template) chip.textContent = readMentionLogicalText(chip);

      return;
    }

    if (existing) {
      this.views.delete(chip);
      existing.view.destroy();
    }

    if (!template) {
      chip.textContent = readMentionLogicalText(chip);

      return;
    }

    this.renderChipView(chip, trigger, template);
  }

  private hydrateChips(chips: readonly HTMLElement[]): void {
    if (chips.length === 0) return;

    const templates = this.resolveTemplates();
    if (templates.size === 0) return;

    // Create views inside Angular's zone so chip-template event handlers schedule change detection.
    this.ngZone.run(() => {
      for (const chip of chips) {
        this.hydrateChip(chip, templates);
      }
    });
  }

  private hydrateChip(
    chip: HTMLElement,
    templates: ReadonlyMap<string, TemplateRef<MentionChipContext>>,
  ): void {
    if (this.views.has(chip)) return;

    const trigger = chip.getAttribute(ATTR_MENTION_TRIGGER) ?? '';
    const template = templates.get(trigger) ?? templates.get('');

    // No matching template: leave the plain-text fallback rendering untouched.
    if (!template) return;

    this.renderChipView(chip, trigger, template);
  }

  /** Creates the embedded view for a chip, moves its nodes into the chip span, and records it. */
  private renderChipView(
    chip: HTMLElement,
    trigger: string,
    template: TemplateRef<MentionChipContext>,
  ): void {
    const context = this.buildContext(chip, trigger);
    const view = this.viewContainerRef.createEmbeddedView(template, context);
    view.detectChanges();

    chip.replaceChildren(...view.rootNodes);
    this.views.set(chip, { view, template });
  }

  /** Destroys views for chips inside `scope` that are no longer attached to the editor root. */
  private destroyDetachedWithin(scope: Element): void {
    if (scope.matches(CHIP_SELECTOR)) this.destroyChipViewIfDetached(scope as HTMLElement);

    scope
      .querySelectorAll<HTMLElement>(CHIP_SELECTOR)
      .forEach((chip) => this.destroyChipViewIfDetached(chip));
  }

  private destroyChipViewIfDetached(chip: HTMLElement): void {
    const existing = this.views.get(chip);
    if (!existing) return;

    // A relocated chip (e.g. line merge) is still in the editor; keep its view.
    if (this.root.contains(chip)) return;

    this.views.delete(chip);
    existing.view.destroy();
  }

  private pruneDetachedViews(): void {
    for (const [chip, existing] of this.views) {
      if (this.root.contains(chip)) continue;

      this.views.delete(chip);
      existing.view.destroy();
    }
  }

  private buildContext(chip: HTMLElement, trigger: string): MentionChipContext {
    const text = readMentionLogicalText(chip);
    const attributes = this.readAttributes(chip);

    const mention: MentionEntity = {
      id: chip.getAttribute(ATTR_MENTION_ID) ?? '',
      label: chip.getAttribute(ATTR_MENTION_LABEL) ?? undefined,
      text,
      start: 0,
      end: 0,
      attributes,
      data: readMentionData(chip),
    };

    return { $implicit: mention, mention, text, trigger };
  }

  private readAttributes(chip: HTMLElement): Record<string, string> | undefined {
    const attrs: Record<string, string> = {};

    for (const attr of Array.from(chip.attributes)) {
      if (INTERNAL_CHIP_ATTRS.has(attr.name)) continue;
      attrs[attr.name] = attr.value;
    }

    return Object.keys(attrs).length > 0 ? attrs : undefined;
  }
}
