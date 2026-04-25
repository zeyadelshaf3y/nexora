/**
 * Shared utility for applying inputs and subscribing to outputs on a
 * dynamically created component. Used by {@link OverlayService} and the
 * snackbar service to avoid duplicating the same binding logic.
 *
 * @internal
 */

import type { ComponentRef, TemplateRef, Type, WritableSignal } from '@angular/core';
import { reflectComponentType } from '@angular/core';

import type { ComponentOutputRef, OpenInputs, OpenOutputs } from '../types/open-types';

/** Type guard: true when content is a component type (constructor), false when TemplateRef. */
export function isComponent(
  content: TemplateRef<unknown> | Type<unknown>,
): content is Type<unknown> {
  return typeof content === 'function';
}

/** Subscription-like object with an `unsubscribe` method. */
interface Unsubscribable {
  unsubscribe(): void;
}

/**
 * Sets inputs on a component ref using the public `setInput()` API (signal-based
 * and legacy-compatible) and triggers change detection once.
 */
export function applyComponentInputs(
  compRef: ComponentRef<unknown>,
  componentType: Type<unknown>,
  inputs: OpenInputs,
): void {
  const keys = Object.keys(inputs);

  if (keys.length === 0) return;

  const useSetInput = typeof compRef.setInput === 'function';
  const mirror = reflectComponentType(componentType);
  const propToName: Record<string, string> = {};
  for (const input of mirror?.inputs ?? []) {
    propToName[input.propName] = input.templateName;
    propToName[input.templateName] = input.templateName;
  }
  const instance = compRef.instance as Record<string, unknown>;

  for (const key of keys) {
    const value = inputs[key];
    const inputName = propToName[key] ?? key;

    if (useSetInput) {
      compRef.setInput(inputName, value);
    } else {
      instance[inputName] = value;
    }
  }

  compRef.changeDetectorRef.detectChanges();
}

/**
 * Subscribes to component outputs, resolving template / prop name aliases via
 * Angular's component mirror. Returns cleanup subscriptions so the caller
 * can unsubscribe when the overlay closes.
 *
 * Handlers can be plain callbacks or `WritableSignal`s — the latter are
 * unwrapped into `.set(v)` calls automatically.
 */
export function subscribeComponentOutputs(
  compRef: ComponentRef<unknown>,
  componentType: Type<unknown>,
  outputs: OpenOutputs,
): Unsubscribable[] {
  const keys = Object.keys(outputs);

  if (keys.length === 0) return [];

  const mirror = reflectComponentType(componentType);
  const propToName: Record<string, string> = {};

  for (const o of mirror?.outputs ?? []) {
    propToName[o.propName] = o.templateName;
    propToName[o.templateName] = o.templateName;
  }

  const subs: Unsubscribable[] = [];
  const instance = compRef.instance as Record<string, unknown>;

  for (const key of keys) {
    const handler = outputs[key];
    const instanceKey = propToName[key] ?? key;
    const out = instance[instanceKey] as ComponentOutputRef | undefined;

    if (out?.subscribe) {
      const fn =
        typeof handler === 'function'
          ? handler
          : (v: unknown) => (handler as WritableSignal<unknown>).set(v);

      const sub = out.subscribe(fn);

      if (sub && typeof sub.unsubscribe === 'function') {
        subs.push(sub);
      }
    }
  }

  return subs;
}

/**
 * Unsubscribes every handle returned by {@link subscribeComponentOutputs} (e.g. when the
 * host overlay or snackbar closes).
 */
export function unsubscribeComponentOutputSubscriptions(subs: readonly Unsubscribable[]): void {
  for (const sub of subs) {
    sub.unsubscribe();
  }
}
