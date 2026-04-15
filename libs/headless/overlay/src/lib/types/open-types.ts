import type {
  EventEmitter,
  Injector,
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
  OutputRef,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';

import type { FocusStrategy } from '../focus/focus-strategy';
import type { DialogPlacement } from '../position/dialog-strategy';
import type { DrawerPlacement } from '../position/drawer-strategy';
import type {
  BeforeCloseCallback,
  BeforeOpenCallback,
  PanelDimensionOptions,
  PanelStylingOptions,
} from '../ref/overlay-config';
import type { OverlayRef } from '../ref/overlay-ref';
import type { ScrollStrategy } from '../scroll/scroll-strategy';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Component I/O inference utilities                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

/** Keys whose value is an Angular output (`OutputRef` or legacy `EventEmitter`). */
export type ExtractOutputKeys<T> = {
  [K in keyof T]: T[K] extends OutputRef<unknown>
    ? K
    : T[K] extends EventEmitter<unknown>
      ? K
      : never;
}[keyof T];

/**
 * Keys whose value is callable — used internally to exclude methods from the
 * input key set.  Angular signal-based inputs (`InputSignal`) are also
 * callable, so they are re-included via {@link InputSignalKeys}.
 * @internal
 */
type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof T];

/** @internal — `infer` names are placeholders only; @typescript-eslint flags them without this scope. */
/* eslint-disable @typescript-eslint/no-unused-vars -- structural infer in conditional types */
type InputSignalKeys<T> = {
  [K in keyof T]: T[K] extends InputSignal<infer _>
    ? K
    : T[K] extends InputSignalWithTransform<infer _, infer _>
      ? K
      : never;
}[keyof T];
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Keys that are component inputs: signal-based `input()` or legacy `@Input()`.
 *
 * Derived by excluding methods and outputs from `keyof T`, then re-adding
 * signal inputs (which are callable and thus initially excluded by `MethodKeys`).
 */
export type ExtractInputKeys<T> =
  | Exclude<Exclude<keyof T, MethodKeys<T>>, ExtractOutputKeys<T>>
  | InputSignalKeys<T>;

/**
 * Resolved write-type for an input field.
 *
 * - `InputSignal<V>` → `V`
 * - `InputSignalWithTransform<_, W>` → `W`  (accepts the *transform* type)
 * - Plain property → property type as-is
 */
export type InputValueType<F> =
  F extends InputSignal<infer V> ? V : F extends InputSignalWithTransform<unknown, infer W> ? W : F;

/** Emitted value type for an output field (`OutputEmitterRef<V>` or `EventEmitter<V>`). */
export type OutputEmittedType<R> =
  R extends OutputEmitterRef<infer V> ? V : R extends EventEmitter<infer V> ? V : never;

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Input / output mapping types                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

/** Untyped inputs record (used by the low-level `OverlayService.open`). */
export type OpenInputs = Record<string, unknown>;

/** Type-safe inputs for component `T`. All keys are optional. */
export type OpenInputsFor<T> = {
  [K in ExtractInputKeys<T> & keyof T]?: InputValueType<T[K]>;
};

/** Handler for a single output value — a callback or a writable signal. */
export type OpenOutputHandler = ((value: unknown) => void) | WritableSignal<unknown>;

/** Type-safe handler for output value `V`. */
export type OpenOutputHandlerFor<V> = ((value: V) => void) | WritableSignal<V>;

/** Union of subscribable output ref types. */
export type ComponentOutputRef = OutputEmitterRef<unknown> | EventEmitter<unknown>;

/** Untyped outputs record (used by the low-level `OverlayService.open`). */
export type OpenOutputs = Record<string, OpenOutputHandler>;

/** Type-safe output handlers for component `T`. All keys are optional. */
export type OpenOutputsFor<T> = {
  [K in ExtractOutputKeys<T> & keyof T]?: OpenOutputHandlerFor<OutputEmittedType<T[K]>>;
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Content open options                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Base options shared by every "open" API (dialog, drawer, overlay).
 * Covers the ViewContainerRef / injector context, lifecycle hooks, and styling.
 */
export interface ContentOpenOptionsBase extends PanelStylingOptions {
  readonly viewContainerRef?: ViewContainerRef;
  readonly injector?: Injector | ((ref: OverlayRef) => Injector);
  readonly beforeOpen?: BeforeOpenCallback;
  readonly beforeClose?: BeforeCloseCallback;
  /** When set, this overlay is nested (e.g. drawer opened from dialog). Outside/backdrop close closes only this and its nested overlays. */
  readonly parentRef?: OverlayRef;
  /**
   * Element whose center becomes the pane's `transform-origin` before
   * the enter animation, so a scale-up appears to grow from the trigger.
   */
  readonly transformOriginElement?: HTMLElement | (() => HTMLElement);
  /**
   * Mount pane and backdrop on this element instead of the global container (e.g. dashboard content area).
   * When set, positioning viewport = this element's rect. See README "Dashboard / content-scoped overlays".
   */
  readonly host?: HTMLElement | (() => HTMLElement);
  /**
   * Element that counts as "inside" for outside-click; clicks inside it do not close the overlay.
   * Use the dashboard root so clicks on header/sidebar do not close a content-scoped dialog.
   */
  readonly outsideClickBoundary?: HTMLElement | (() => HTMLElement);
  /**
   * Z-index for this overlay. When set, overrides the stack default (base + order).
   * Use with {@link OVERLAY_BASE_Z_INDEX} so overlays sit above app chrome (header/sidebar).
   */
  readonly zIndex?: number;
}

/** Content options when opening with a component (includes inputs / outputs). */
export interface OpenOptionsForComponent<T> extends ContentOpenOptionsBase {
  readonly inputs?: OpenInputsFor<T>;
  readonly outputs?: OpenOutputsFor<T>;
}

/** Content options when opening with a template. */
export type OpenOptionsForTemplate = ContentOpenOptionsBase;

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Panel behaviour shared by dialog & drawer services                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Dimension + behaviour options shared by {@link DialogOpenOptions} and
 * {@link DrawerOpenOptions}.  Extends {@link PanelDimensionOptions} with
 * strategy and chrome fields that the convenience services default for you.
 */
export interface OverlayPanelOptions extends PanelDimensionOptions {
  /** Scroll strategy while overlay is open. Default: `BlockScrollStrategy`. */
  readonly scrollStrategy?: ScrollStrategy;
  /** Focus behaviour on open / close. Default: `DefaultFocusStrategy`. */
  readonly focusStrategy?: FocusStrategy;
  /** Show a backdrop behind the overlay. Default: `true`. */
  readonly hasBackdrop?: boolean;
  /** Close-animation duration in ms. Default: `300`. Set `0` for instant close. */
  readonly closeAnimationDurationMs?: number;
  /**
   * Accessible label for the overlay pane. Applied as `aria-label` attribute.
   * Use when the overlay content does not contain a visible heading.
   */
  readonly ariaLabel?: string;
  /**
   * ID of the element that labels the overlay pane. Applied as `aria-labelledby` attribute.
   * Use when a visible heading already exists inside the overlay content.
   */
  readonly ariaLabelledBy?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Service-specific open options                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Options for `DialogService.open()`.
 *
 * Defaults: `BlockScrollStrategy`, `DefaultFocusStrategy`, `hasBackdrop: true`,
 * `placement: 'center'`.
 */
export interface DialogOpenOptions extends ContentOpenOptionsBase, OverlayPanelOptions {
  readonly placement?: DialogPlacement;
}

/**
 * Options for `DrawerService.open()`.
 *
 * Defaults: `BlockScrollStrategy`, `DefaultFocusStrategy`, `hasBackdrop: true`,
 * `placement: 'end'`.
 *
 * **start / end** — height fills viewport, width sizes to content.
 * **top / bottom** — width fills viewport, height sizes to content.
 */
export interface DrawerOpenOptions extends ContentOpenOptionsBase, OverlayPanelOptions {
  /** Edge to attach drawer to. Default: `'end'`. */
  readonly placement?: DrawerPlacement;
}
