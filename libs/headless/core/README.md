# @nexora-ui/core

Minimal foundation for Nexora headless UI: platform utilities (DOM, env, id, events, animation, layout, debug).

## Installation

```bash
npm install @nexora-ui/core
```

## Tree-shaking

The package is built with **`sideEffects: false`**. Import only what you use; your bundler will drop unused exports.

```ts
import { createId, canUseDOM, getActiveElement, listen } from '@nexora-ui/core';
```

Avoid namespace imports if you want the smallest bundle:

```ts
// Prefer named imports
import { createId, canUseDOM } from '@nexora-ui/core';

// Namespace import can prevent tree-shaking in some setups
import * as core from '@nexora-ui/core';
```

## API surface

Platform-only: SSR-safe helpers for DOM, env, id, events, animation, layout, debug. All exports listed in the **Platform modules** table below are considered **stable public API** for use by applications and other Nexora libs; there are no internal-only exports from the main package. We avoid breaking these in minor/patch releases.

## Layering

- **core** does not depend on overlay, interactions, popover, or snackbar.
- Overlay and other headless libs depend on core for platform utilities.

## Platform modules

| Area          | Exports                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **env**       | `canUseDOM`, `getGlobal`                                                                                                                          |
| **id**        | `createId`, `idFactory`                                                                                                                           |
| **dom**       | `ownerDocument`, `getActiveElement`, `safeFocus`, `contains`, `hasClosest`, `scrollParents`, `observeResize`, `getViewportRect`, `getResolvedDir` |
| **events**    | `listen`, `composeHandlers`                                                                                                                       |
| **animation** | `rafThrottle`, `createRafThrottled`, `prefersReducedMotion`                                                                                       |
| **layout**    | `Rect`, `rectsIntersect`, `rectFromSize`, `clamp`                                                                                                 |
| **value**     | `resolveMaybeGetter`                                                                                                                              |
| **debug**     | `warnOnce`, `invariant`                                                                                                                           |

All DOM/window access is guarded for SSR; functions return safe defaults or no-ops when the DOM is not available.

Examples:

- `dom`: `const off = listen(window, 'resize', onResize); off();`
- `events`: `const onClick = composeHandlers(userHandler, internalHandler);`
- `id`: `const id = createId();`
- `animation`: `const throttled = createRafThrottled(run);`
- `layout`: `const clamped = clamp(value, min, max);`
- `value`: `const anchor = resolveMaybeGetter(options.anchor);`

## Running unit tests

Run `nx test core` to execute the unit tests.

## Running lint

Run `nx lint core` to lint the package.

## See also

- [HEADLESS.md](../../../docs/HEADLESS.md)
- [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)
