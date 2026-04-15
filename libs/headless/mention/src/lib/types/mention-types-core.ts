/**
 * Core mention types: matching, sessions, triggers, panel options, document model.
 */

import type {
  ArrowSize,
  BeforeCloseCallback,
  BeforeOpenCallback,
  ClosePolicy,
  Placement,
  ScrollStrategy,
  ViewportBoundaries,
} from '@nexora-ui/overlay';
import type { Observable } from 'rxjs';

/**
 * Result of {@link MentionTriggerConfig.getItems}. Prefer immutable arrays: callers must not mutate
 * returned lists; the controller stores them as `readonly T[]`.
 */
export type MentionItemsResult<T> = readonly T[] | Promise<readonly T[]> | Observable<readonly T[]>;

export type MentionAttributes = Readonly<Record<string, string>>;

export type MentionLinearRange = { readonly start: number; readonly end?: number };

/** Pure parser output: no id, no DOM, no status. */
export interface MentionMatch {
  readonly trigger: string;
  readonly query: string;
  readonly rangeStart: number;
  readonly rangeEnd: number;
}

/** Result of insertWith(item, session); used by adapter replaceTextRange. */
export interface MentionInsertion {
  readonly replacementText: string;
  /** 'end' or offset from start of replacement. Default 'end'. */
  readonly caretPlacement?: 'end' | number;
  /** Stable mention identifier used for extraction/getMentions/getDocument and chip lookup APIs. */
  readonly mentionId?: string;
  /** Human-friendly mention label stored on the chip for serialization and integrations. */
  readonly mentionLabel?: string;
  /**
   * Extra attributes for the mention span (e.g. class, data-*).
   * Prefer `mentionId`/`mentionLabel` for core metadata.
   */
  readonly mentionAttributes?: MentionAttributes;
}

/** Runtime session enriched from MentionMatch; has id for stale async protection. */
export interface MentionSession<T = unknown> {
  readonly id: number;
  readonly match: MentionMatch;
  readonly triggerConfig: MentionTriggerConfig<T>;
  readonly caretRect: DOMRect | null;
  /**
   * Lifecycle hint. The controller sets `'open'` during normal mention detection; programmatic
   * `insertMention` uses `'committing'`. Other union members are reserved for future internal use.
   */
  readonly status: 'opening' | 'loading' | 'open' | 'committing' | 'closed';
}

/**
 * Overlay and panel behavior for a single {@link MentionTriggerConfig}, applied when the
 * suggestion panel opens for that trigger.
 *
 * **Precedence**
 * - {@link MentionTriggerConfig.panel} only affects the overlay for **that** trigger’s sessions.
 * - Directive inputs (`nxrMentionPlacement`, `nxrMentionOffset`, `nxrMentionBeforeOpen`, …) remain
 *   the defaults. Per-trigger fields here **override** placement/offset when set.
 * - **`beforeOpen` / `beforeClose`:** the directive callbacks run **first**; if they do not return
 *   `false`, the trigger’s `panel.beforeOpen` / `panel.beforeClose` run. Returning `false` from
 *   either hook prevents open/close (same contract as {@link BeforeOpenCallback} /
 *   {@link BeforeCloseCallback}).
 *
 * **When the panel is already open:** if the user switches to another trigger without closing,
 * the existing overlay is **not** recreated; scroll strategy and other overlay options stay those
 * from the first open until the panel closes.
 *
 * **Grouping:** positioning (`placement`, `offset`, `clampToViewport`, `preferredPlacementOnly`,
 * `fallbackPlacements`, `boundaries`), scroll (`scrollStrategy`, `maintainInViewport`), close
 * (`closePolicy`, `closeAnimationDurationMs`, `beforeClose`), open (`beforeOpen`), pane chrome
 * (`panelClass`, `panelStyle`, sizing, `arrowSize`, `ariaLabel`, `ariaLabelledBy`).
 */
export interface MentionTriggerPanelOptions {
  /**
   * How document scroll is handled while the panel is open. Default: `RepositionScrollStrategy`
   * (reposition with the virtual caret anchor; same as the built-in mention default).
   *
   * Other strategies (`NoopScrollStrategy`, `CloseOnScrollStrategy`, …) come from
   * `@nexora-ui/overlay`.
   */
  readonly scrollStrategy?: ScrollStrategy;
  /**
   * Forwarded to `createAnchoredOverlayConfig`. For `RepositionScrollStrategy`, controls whether
   * the panel stays viewport-clamped when the anchor moves (default `true`). Other scroll
   * strategies may ignore this; it remains on the overlay config for consistency with the overlay
   * API.
   */
  readonly maintainInViewport?: boolean;
  /** Override {@link MentionTriggerConfig}’s default anchored placement for this trigger. */
  readonly placement?: Placement;
  /** Override panel distance from the anchor (px) for this trigger. */
  readonly offset?: number;
  /**
   * Merged on top of mention defaults (`escape` / `outside` close). See `ClosePolicy` in
   * `@nexora-ui/overlay`. **`backdrop` is ignored:** the mention panel never uses a backdrop, so
   * the implementation always keeps `backdrop: 'none'`.
   */
  readonly closePolicy?: Partial<ClosePolicy>;
  /**
   * Passed to `createAnchoredOverlayConfig`. Default: `true`.
   * `NoopScrollStrategy` / `RepositionScrollStrategy` still apply their own placement rules; this
   * mainly matters for other scroll strategies.
   */
  readonly clampToViewport?: boolean;
  /**
   * When `true`, the anchored strategy sticks to the preferred placement only (no fallback
   * placements). See `createAnchoredOverlayConfig`.
   */
  readonly preferredPlacementOnly?: boolean;
  /** Extra placement candidates for the anchored strategy. */
  readonly fallbackPlacements?: readonly Placement[];
  /** Viewport inset for max dimensions / fitting (anchored overlay). */
  readonly boundaries?: ViewportBoundaries;
  /** Extra CSS class(es) on the overlay pane, merged after the library and directive pane classes. */
  readonly panelClass?: string | string[];
  /** Optional pane size hints (same semantics as anchored `OverlayConfig`). */
  readonly width?: string;
  readonly height?: string;
  readonly minWidth?: string;
  readonly minHeight?: string;
  readonly maxWidth?: string;
  readonly maxHeight?: string;
  readonly panelStyle?: Record<string, string>;
  /**
   * Arrow size (px) when the anchored strategy returns arrow offset. See overlay `ArrowSize`.
   */
  readonly arrowSize?: ArrowSize;
  /**
   * `aria-label` on the overlay pane (list/suggestions). Separate from `nxrMentionAriaLabel` on
   * the editor.
   */
  readonly ariaLabel?: string;
  /** `aria-labelledby` on the overlay pane. */
  readonly ariaLabelledBy?: string;
  /**
   * Close animation duration (ms) before detach. Overrides `nxrMentionCloseAnimationDurationMs`
   * for this trigger’s overlay.
   */
  readonly closeAnimationDurationMs?: number;
  /**
   * Runs after `nxrMentionBeforeOpen` (if any) when this trigger opens the panel.
   * Return `false` (or a Promise resolving to `false`) to cancel the open.
   */
  readonly beforeOpen?: BeforeOpenCallback;
  /**
   * Runs after `nxrMentionBeforeClose` (if any) when this trigger’s panel would close.
   * Return `false` to veto close for the given close reason (see overlay `BeforeCloseCallback`).
   */
  readonly beforeClose?: BeforeCloseCallback;
}

/** Per-trigger configuration. v1: trigger is a single character. */
export interface MentionTriggerConfig<T = unknown> {
  readonly trigger: string;
  /** Show suggestions immediately when trigger is typed (query length 0). */
  readonly openOnTrigger?: boolean;
  /** Do not call getItems until query.length >= this. Default 0. */
  readonly minQueryLength?: number;
  /**
   * When set (≥ 0), no active mention match if the query segment after the trigger exceeds this length.
   * Use to cap expensive lookups or UI height.
   */
  readonly maxQueryLength?: number;
  readonly allowSpacesInQuery?: boolean;
  /** Require word/line boundary before trigger (e.g. no 'email@'). Default true for @ and #. */
  readonly requireLeadingBoundary?: boolean;
  /**
   * Auto-close the panel when getItems returns an empty array.
   * Default true. Set false to keep the panel open for custom "no results" UI.
   */
  readonly closeOnNoResults?: boolean;
  /** Single source of items: sync, Promise, or Observable. */
  /**
   * Supplies suggestion items for the current `query`. May return a sync array, a Promise, or an
   * Observable. Return **`readonly T[]`** (or emit the same) so consumers do not rely on mutation.
   */
  readonly getItems: (query: string, session: MentionSession<T>) => MentionItemsResult<T>;
  /** Label for the list UI (need not match inserted text). */
  readonly displayWith: (item: T) => string;
  /**
   * Text inserted for the selected range `[rangeStart, rangeEnd)` (trigger + query).
   * Omit to use `displayWith(item)` as plain replacement text.
   */
  readonly insertWith?: (item: T, session: MentionSession<T>) => MentionInsertion;
  readonly closeOnSelect?: boolean;
  readonly selectOnEnter?: boolean;
  readonly selectOnTab?: boolean;
  /**
   * Optional per-item class merged with `mentionAttributes.class`
   * and directive-level chip class.
   */
  readonly getMentionClass?: (item: T) => string | undefined;
  /** Optional visual/custom attributes for the mention span (e.g. class, data-*). */
  readonly getMentionAttributes?: (item: T) => MentionAttributes;
  /** Called before a mention is inserted. Return `false` to prevent insertion and panel close. */
  readonly beforeInsert?: (item: T, session: MentionSession<T>) => boolean | undefined;
  /** Called after a mention has been inserted into the editor. */
  readonly afterInsert?: (item: T, session: MentionSession<T>) => void;
  /**
   * Optional anchored-overlay behavior for this trigger. See {@link MentionTriggerPanelOptions}
   * for the full map, grouping, and precedence vs directive inputs.
   */
  readonly panel?: MentionTriggerPanelOptions;
}

/** Read-only state exposed to panel template. */
export interface MentionPanelState<T = unknown> {
  readonly session: MentionSession<T> | null;
  readonly trigger: string | null;
  readonly query: string;
  readonly items: readonly T[];
  readonly loading: boolean;
  readonly activeIndex: number;
  readonly open: boolean;
  readonly error?: unknown;
}

/** Internal controller state. */
export interface MentionControllerState<T = unknown> {
  readonly session: MentionSession<T> | null;
  readonly items: readonly T[];
  readonly loading: boolean;
  readonly activeIndex: number;
}

/** Mention entity serialized for persistence/editing round-trips. */
export interface MentionEntity {
  readonly id: string;
  readonly label?: string;
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly attributes?: MentionAttributes;
}

/** Serializable editor document sent to/from backend. */
export interface MentionDocument {
  readonly bodyText: string;
  readonly mentions: readonly MentionEntity[];
}
