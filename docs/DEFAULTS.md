# Defaults and Providers

How defaults are resolved for overlay-based headless components.

## Precedence

For a given value, the resolution order is:

1. Library hardcoded default
2. Global overlay defaults (`provideOverlayDefaults`)
3. Component/service defaults provider (for example `providePopoverDefaults`)
4. Per-instance input or `open(..., options)` value

`nxrBackdropClass` and `nxrBackdropStyles` are additive hooks and are merged after base backdrop class/style resolution.

## Global Overlay Defaults

Use `provideOverlayDefaults` from `@nexora-ui/overlay` to set cross-cutting defaults:

- `hasBackdrop`
- `closeAnimationDurationMs`
- `maintainInViewport`
- `boundaries`
- `panelClass` / `panelStyle`
- `backdropClass` / `backdropStyle`
- `nxrBackdropClass` / `nxrBackdropStyles`
- `classMergeMode`: `'replace' | 'append'`
- `styleMergeMode`: `'replace' | 'merge'`

Notes:

- Popover, select, combobox, and menu consume all of the above keys.
- Dialog and drawer currently consume the shared visual defaults (`hasBackdrop`, `closeAnimationDurationMs`, and panel/backdrop class/style defaults).
- In dev mode, dialog and drawer warn if `maintainInViewport` or `boundaries` are set in `provideOverlayDefaults(...)`, because those keys are not consumed by panel services.

Example:

```ts
provideOverlayDefaults({
  classMergeMode: 'append',
  styleMergeMode: 'merge',
  nxrBackdropClass: 'app-backdrop',
  closeAnimationDurationMs: 120,
});
```

## Component/Service Defaults

Each overlay-based package has a local defaults provider:

- `providePopoverDefaults`
- `provideSelectDefaults`
- `provideComboboxDefaults`
- `provideMenuDefaults`
- `provideDialogDefaults`
- `provideDrawerDefaults`

Dialog + drawer can also be configured together via:

- `providePanelServicesDefaults({ dialog, drawer })`

## Close Policy Presets

`@nexora-ui/overlay` exposes reusable close policy presets:

- `CLOSE_POLICY_PRESET_MODAL`
- `CLOSE_POLICY_PRESET_NON_MODAL`
- `CLOSE_POLICY_PRESET_STRICT_MODAL`
- `getClosePolicyPreset(name)`

Use these as a starting point and override fields if needed.

## Feature-Scoped Defaults

All defaults providers can be used at any DI scope (app-level, route-level, or feature component-level).  
This enables per-area behavior without changing every component instance.
