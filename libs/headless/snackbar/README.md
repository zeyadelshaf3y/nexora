# @nexora-ui/snackbar

Headless snackbar: open with a template or component, position at viewport edges, optional auto-close and close-with-value. No default styling—you provide content and styles. Stacks by placement. **Replace-by-group**: pass `groupId` so only one snackbar per group is shown. Tree-shakable: only import when using snackbars.

**Public API:** Exports from `src/index.ts` are stable for consumers ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## Usage

```ts
// In a component (viewContainerRef optional; OverlayService provides a default automatically)
constructor(private snackbar: SnackbarService) {}

openSuccess() {
  const ref = this.snackbar.open(SuccessSnackbarComponent, {
    placement: 'bottom-end',
    duration: 5000,
    inputs: { message: 'Saved!' },
  });
  ref.afterClosed().subscribe((_value) => {
    /* optional payload from dismiss/close — use `_value` when you pass one via close directive */
  });
}

// With a template
openWithTemplate() {
  this.snackbar.open(this.snackbarTpl, {
    placement: 'top',
    duration: 0, // no auto-close
    data: { message: 'Hello' },
  });
}

// Replace-by-group: only one snackbar per groupId at a time
openNotification() {
  this.snackbar.open(this.snackbarTpl, {
    placement: 'bottom-end',
    groupId: 'notifications',
    data: { message: 'New message' },
  });
}

// Notify API with default component (opt-in)
notifySuccess() {
  this.snackbar.notify({
    pauseOnHover: true,
    inputs: {
      variant: 'success',
      title: 'Saved',
      message: 'Profile updated',
      actionLabel: 'Dismiss',
    },
  });
}
```

```html
<ng-template #snackbarTpl let-message="message">
  <span>{{ message }}</span>
  <button nxrSnackbarClose>Dismiss</button>
  <button [nxrSnackbarClose]="'undo'">Undo</button>
</ng-template>
```

## API

### SnackbarService.open(content, options?)

- **content**: `TemplateRef<unknown>` or `ComponentType<T>`.
- **options** (all optional):
  - **host**: `HTMLElement` or `() => HTMLElement`. When set, snackbars are positioned inside this element (e.g. dashboard content area). Placement is relative to the host rect; pane is constrained to the host. Omit for full-viewport behavior.
  - **placement**: `'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end'` — default `'bottom-end'`.
  - **duration**: ms to auto-close; `0` = no auto-close. Default `4000`.
  - **groupId**: when set, only one snackbar per group is shown; opening another with the same `groupId` closes the previous (replace-by-group). Omit to allow stacking.
  - **maxVisibleSnackbars**: per-placement visible cap. Older snackbars beyond the cap are hidden (not closed) and re-shown when visible slots free up.
  - **viewContainerRef**: optional; uses the same default as `OverlayService` (internal host or default set via `setDefaultViewContainerRef`).
  - **injector**, **panelClass**, **panelStyle**, **stackGap**, **padding**, **closeAnimationDurationMs**.
  - For component: **inputs**, **outputs**.
  - For template: **data** (context).

Returns `SnackbarRef<T>`:

- `close(value?)`
- `dismiss(value?)`
- `afterClosed(): Observable<T | undefined>`
- `getPaneElement()`
- `autoCloseState(): Observable<{ durationMs; remainingMs; progress; paused }>`
- `pauseAutoClose()`
- `resumeAutoClose()`

### SnackbarService.notify(options)

`notify(...)` opens a configured default component. It requires `provideSnackbarDefaults(...)`.
`notify(...)` is a direct pass-through API:

- Pass snackbar behavior/styling as top-level open options (`placement`, `duration`, `panelClass`, etc.).
- Pass default component values via `inputs`.
- Pass default component event handlers via `outputs`.

```ts
import { provideSnackbarDefaults } from '@nexora-ui/snackbar';

providers: [
  provideSnackbarDefaults({
    component: AppSnackbarComponent,
    defaultOpenOptions: {
      placement: 'bottom-end',
      duration: 4000,
      panelClass: 'app-snackbar',
      showProgress: true,
      maxVisibleSnackbars: 3,
    },
    maxVisibleSnackbars: 3,
  }),
];
```

Then call:

```ts
this.snackbar.notify({
  pauseOnHover: true,
  inputs: {
    variant: 'success',
    title: 'Saved',
    message: 'Profile updated',
    actionLabel: 'Dismiss',
  },
  outputs: {
    actionClick: () => this.undoLastChange(),
  },
});
```

Per-call options override `defaultOpenOptions` on conflicts.

There is no `mapInputs` / `mapOutputs` layer in the current API.

### Typing `notify(...)` without explicit generics

`notify(...)` defaults to `unknown` component type unless you provide a global app typing.
Add module augmentation once in your app (e.g. `src/app/core/snackbar-notify-typing.d.ts`):

```ts
import type { AppSnackbarComponent } from './app-snackbar.component';

declare module '@nexora-ui/snackbar' {
  interface SnackbarNotifyComponentMap {
    appSnackbar: AppSnackbarComponent;
  }
}
```

After that, `this.snackbar.notify({ inputs, outputs })` gets autocomplete for your default component inputs/outputs without writing `notify<AppSnackbarComponent>(...)`.

### Styling hooks

| Hook                  | Type                     | Applies to   | Notes                                                                     |
| --------------------- | ------------------------ | ------------ | ------------------------------------------------------------------------- |
| `panelClass`          | `string \| string[]`     | Overlay pane | Preferred for reusable themes and animation states.                       |
| `panelStyle`          | `Record<string, string>` | Overlay pane | Inline one-off pane style overrides.                                      |
| `placement`           | `SnackbarPlacement`      | Positioning  | Viewport/host edge placement and stack direction.                         |
| `stackGap`            | `number`                 | Stack layout | Gap in px between snackbars in the same placement lane.                   |
| `padding`             | `number`                 | Stack layout | Offset from host/viewport edge in px.                                     |
| `width`               | `string`                 | Overlay pane | Fixed pane width (optional).                                              |
| `maxWidth`            | `string`                 | Overlay pane | Pane maximum width constraint.                                            |
| `showProgress`        | `boolean`                | Overlay pane | Writes `--nxr-snackbar-progress` (`1 -> 0`) on pane style.                |
| `pauseOnHover`        | `boolean`                | Auto-close   | When true, pauses countdown while pointer is over pane.                   |
| `maxVisibleSnackbars` | `number`                 | Queue policy | Max visible per placement; older active snackbars are hidden, not closed. |

Use classes for reusable themes and animations; use `panelStyle` for one-off overrides.

`maxWidth` is internally clamped to viewport width minus placement padding, so panes never overflow the viewport even if a larger value is passed.

### Auto-close progress + hover pause

- Use `showProgress: true` to expose countdown ratio on pane style as `--nxr-snackbar-progress`.
- Use `pauseOnHover: true` to pause/resume timer while hovering the snackbar pane.
- Default is `pauseOnHover: false`.
- `SnackbarRef.autoCloseState()` emits `{ durationMs, remainingMs, progress, paused }`.
- `SnackbarRef.pauseAutoClose()` / `resumeAutoClose()` provide programmatic control.

### Max Visible Queue

- `maxVisibleSnackbars` applies per placement lane (`top-start`, `bottom-end`, etc.).
- Exceeding the cap hides oldest snackbars in that lane without closing them.
- Hidden snackbars remain active: they still auto-close and can still be closed programmatically.
- When a visible snackbar closes, the oldest hidden active snackbar is re-shown.
- Precedence: per-call `open/notify` option > defaults provider > unlimited library default.
- Conflict guard: while a placement queue is active, its cap is locked for that queue. If a later `open/notify` call in the same placement passes a different cap, the active queue cap is kept and the new value applies only after that placement queue drains.

### nxrSnackbarClose

Directive on an element inside snackbar content. On click, closes the snackbar. Optional value: `[nxrSnackbarClose]="value"` so `afterClosed()` emits that value.

### ViewContainerRef

**viewContainerRef** is optional. The snackbar uses the same default as `OverlayService` (internal host or the default set via `setDefaultViewContainerRef`).

## Stacking and placement

Snackbars at the same placement stack (new ones push previous down or up). Use **panelClass** and **data-placement** (e.g. `snackbar-bottom-end`) for your CSS. When one closes, the rest at that placement reflow.

To animate stack reflow (remaining snackbars sliding into place), include position transitions in your open pane styles, because snackbar stacking updates pane coordinates (`top`/`left`) during reposition:

```css
.app-snackbar.nxr-overlay-pane--open {
  transition:
    top 0.24s cubic-bezier(0.32, 0.72, 0, 1),
    left 0.24s cubic-bezier(0.32, 0.72, 0, 1),
    transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.2s ease;
}
```

**RTL**: Placements `top-start`, `top-end`, `bottom-start`, and `bottom-end` are RTL-aware: when the document (or host) has `dir="rtl"`, start/end flip so snackbars appear on the correct side.

## Boundaries (host)

To show snackbars inside a specific region (e.g. dashboard content area instead of the full window), pass **host** in options:

```ts
// e.g. in a dashboard component
@ViewChild('contentArea') contentAreaRef?: ElementRef<HTMLElement>;

openSnackbar() {
  this.snackbar.open(this.snackbarTpl, {
    host: this.contentAreaRef?.nativeElement,
    placement: 'bottom-end',
    data: { message: 'Saved!' },
  });
}
```

When **host** is set, the overlay uses that element’s rect for positioning and caps the pane size to the host, so snackbars stay within the boundary.

## Internal structure

`src/lib/` is organized by domain (aligned with `@nexora-ui/overlay`):

- **ref/** — `SnackbarRef` interface, `SnackbarRefImpl`, injection tokens (`SNACKBAR_REF`, etc.)
- **position/** — `SnackbarPlacement` type, `SnackbarPositionStrategy` (viewport-edge positioning and stacking)
- **options/** — `SnackbarOpenOptions` and related types for `open()`
- **service/** — `SnackbarService` (open, registry, auto-close)
- **directives/** — `CloseSnackbarDirective` (`nxrSnackbarClose`)
- **host/** — `SnackbarHostComponent` (internal: hosts template content in the pane)

Public API is re-exported from `src/index.ts`. Depends on `@nexora-ui/overlay`.

## Running unit tests

Run `nx test snackbar` to execute the unit tests.
