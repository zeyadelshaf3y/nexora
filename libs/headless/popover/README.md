# @nexora-ui/popover

Directive that opens a popover overlay anchored to the host element. Pass the panel content as a TemplateRef. Close behavior aligns with the open trigger: click → outside/escape, focus → blur, hover → leave. Click trigger does not cancel default browser behavior or stop event propagation.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## Usage

```html
<!-- Click (default) -->
<button [nxrPopover]="panelTpl">Open popover</button>

<!-- Focus: open on focus, close when focus leaves trigger and panel -->
<button [nxrPopover]="panelTpl" nxrPopoverTrigger="focus">Open on focus</button>

<!-- Hover: open on mouse enter; close when mouse leaves (or when leaving trigger only if nxrPopoverAllowContentHover is false) -->
<button [nxrPopover]="panelTpl" nxrPopoverTrigger="hover">Open on hover</button>

<!-- Open on any of multiple triggers -->
<button [nxrPopover]="panelTpl" [nxrPopoverTrigger]="['hover', 'focus']">
  Open on hover or focus
</button>

<!-- Open state and close reason (use #ref="nxrPopover" to read isOpen() / paneId()) -->
<button
  #popover="nxrPopover"
  [nxrPopover]="panelTpl"
  (nxrPopoverOpened)="onOpen()"
  (nxrPopoverClosed)="onClose($event)"
>
  {{ popover.isOpen() ? 'Close' : 'Open' }}
</button>

<ng-template #panelTpl>
  <div>Popover content.</div>
</ng-template>
```

## Arrow (optional)

To show an arrow pointing at the trigger, add one element with **`nxrOverlayArrow`** (from `@nexora-ui/overlay`) and give the pane a class that allows overflow (so the arrow can sit outside). Use the same template for the panel content:

```html
<button [nxrPopover]="panelTpl" nxrPopoverPanelClass="nxr-popover-pane">Open</button>

<ng-template #panelTpl>
  <div nxrOverlayArrow class="my-arrow"></div>
  <div class="panel-content">Popover content.</div>
</ng-template>
```

In your CSS: target the pane (e.g. `.nxr-popover-pane`) with `overflow: visible`, and style `.my-arrow` as a triangle (e.g. borders or clip-path). The arrow is positioned and rotated automatically; it hides when the trigger scrolls out of view. To use a custom arrow size, set **`nxrPopoverArrowSize`** (e.g. `{ width: 14, height: 7 }`).

## Accessibility

The directive sets on the trigger:

- **aria-expanded** — `true` when open, `false` when closed
- **aria-haspopup** — `"true"`
- **aria-controls** — id of the panel pane when open

The panel pane gets a stable **id** and **role="dialog"**. Use a template reference to bind to the directive and read `isOpen()` or `paneId()` if you need them in the template.

## Touch devices

On touch devices, **hover** does not apply (there is no persistent hover state). Use **trigger="click"** (or **focus** where appropriate) for touch-friendly popovers. The **hover** trigger is intended for pointer/mouse use.

## API

| Input                                | Type                                     | Default          | Description                                                                                                                                                                                                      |
| ------------------------------------ | ---------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nxrPopover`                         | `TemplateRef<unknown>`                   | required         | Template for the popover panel content.                                                                                                                                                                          |
| `nxrPopoverTrigger`                  | `'click' \| 'focus' \| 'hover'` or array | `'click'`        | When to open. Pass an array (e.g. `['hover','focus']`) to open on any of them.                                                                                                                                   |
| `nxrPopoverPlacement`                | `Placement`                              | `'bottom-start'` | Preferred placement (12 positions, RTL/LTR aware).                                                                                                                                                               |
| `nxrPopoverHasBackdrop`              | `boolean`                                | `false`          | Whether to render a backdrop behind the popover pane.                                                                                                                                                            |
| `nxrPopoverOffset`                   | `number`                                 | `8`              | Gap in px between anchor and panel. For hover with allowContentHover, a bridge fills this gap so moving to the panel does not close.                                                                             |
| `nxrPopoverAllowContentHover`        | `boolean`                                | `true`           | When trigger is hover: if true, hovering the panel or gap keeps it open; if false, it closes when the pointer leaves the anchor.                                                                                 |
| `nxrPopoverDisabled`                 | `boolean`                                | `false`          | When true, the trigger does not open the popover.                                                                                                                                                                |
| `nxrPopoverAnchor`                   | `HTMLElement \| null`                    | —                | Optional external anchor element. When set, the popover positions to this element and listens for trigger events (click/focus/hover) on it instead of the directive host.                                        |
| `nxrPopoverCloseOnScroll`            | `boolean`                                | `false`          | When true, the popover closes on window scroll; when false, it repositions to stay anchored.                                                                                                                     |
| `nxrPopoverPreferredPlacementOnly`   | `boolean`                                | `false`          | When true, the overlay keeps the preferred placement and only clamps to the viewport. When false, the strategy may flip (e.g. from bottom-start to bottom-end) when the preferred placement would go off-screen. |
| `nxrPopoverOpenDelay`                | `number`                                 | `0`              | Delay in ms before opening (focus and hover only). If the user leaves before the delay, the open is cancelled.                                                                                                   |
| `nxrPopoverCloseDelay`               | `number`                                 | —                | When set, used as the close delay for both hover and focus. When not set, `nxrPopoverHoverCloseDelay` and `nxrPopoverFocusCloseDelay` are used.                                                                  |
| `nxrPopoverHoverCloseDelay`          | `number`                                 | `100`            | Delay in ms before closing on hover (mouse leave). Used when `nxrPopoverCloseDelay` is not set.                                                                                                                  |
| `nxrPopoverFocusCloseDelay`          | `number`                                 | `150`            | Delay in ms before closing on focus blur. Used when `nxrPopoverCloseDelay` is not set.                                                                                                                           |
| `nxrPopoverBeforeOpen`               | `BeforeOpenCallback`                     | —                | Called before opening. Return false to prevent opening.                                                                                                                                                          |
| `nxrPopoverBeforeClose`              | `BeforeCloseCallback`                    | —                | Called before closing. Return false to prevent closing.                                                                                                                                                          |
| `nxrPopoverPanelClass`               | `string \| string[]`                     | —                | CSS class(es) applied to the overlay pane. Use for styling and animations (e.g. `nxr-popover-pane` with `overflow: visible` when using an arrow).                                                                |
| `nxrPopoverPanelStyle`               | `Record<string,string>`                  | —                | Inline styles applied to the overlay pane. Prefer `nxrPopoverPanelClass` for reusable themes; use this for one-off overrides.                                                                                    |
| `nxrPopoverBackdropClass`            | `string \| string[]`                     | —                | CSS class(es) applied to the backdrop when `nxrPopoverHasBackdrop` is true.                                                                                                                                      |
| `nxrPopoverBackdropStyle`            | `Record<string,string>`                  | —                | Inline styles applied to the backdrop when `nxrPopoverHasBackdrop` is true.                                                                                                                                      |
| `nxrPopoverCloseAnimationDurationMs` | `number`                                 | `0`              | Ms to wait for close animation before removing the pane. Set to 0 for instant close; set e.g. 150 to allow an exit animation (style `.nxr-overlay-pane--closing`).                                               |
| `nxrPopoverArrowSize`                | `{ width: number; height: number }`      | —                | Arrow dimensions in px. Omit to use default 12×6. Used when the panel template includes an element with `nxrOverlayArrow`.                                                                                       |

### Styling hooks

| Hook                      | Type                                | Applies to       | Notes                                                                                 |
| ------------------------- | ----------------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `nxrPopoverPanelClass`    | `string \| string[]`                | Overlay pane     | Preferred for reusable themes and animation states.                                   |
| `nxrPopoverPanelStyle`    | `Record<string, string>`            | Overlay pane     | Inline one-off pane style overrides.                                                  |
| `nxrPopoverBackdropClass` | `string \| string[]`                | Backdrop element | Used only when `nxrPopoverHasBackdrop` is `true`.                                     |
| `nxrPopoverBackdropStyle` | `Record<string, string>`            | Backdrop element | Inline one-off backdrop style overrides.                                              |
| `nxrPopoverPlacement`     | `Placement`                         | Positioning      | Preferred anchor placement (with fallback unless `nxrPopoverPreferredPlacementOnly`). |
| `nxrPopoverOffset`        | `number`                            | Anchor gap       | Gap in px between trigger anchor and pane.                                            |
| `nxrPopoverArrowSize`     | `{ width: number; height: number }` | Arrow element    | Applies when panel template includes `nxrOverlayArrow`.                               |

### Outputs

| Output             | Type          | Description                                                                                                                               |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `nxrPopoverOpened` | —             | Emitted when the popover has finished opening (no payload).                                                                               |
| `nxrPopoverClosed` | `CloseReason` | Emitted when the popover has closed. Payload is the close reason: `'escape'`, `'outside'`, `'backdrop'`, `'programmatic'`, or `'scroll'`. |

### Public state (template / programmatic)

| Property | Type                     | Description                                                                                            |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `isOpen` | `Signal<boolean>`        | Whether the popover is currently open. Use in templates for styling or labels (e.g. "Open" / "Close"). |
| `paneId` | `Signal<string \| null>` | Id of the panel pane when open; `null` when closed. The trigger’s `aria-controls` is bound to this.    |

### Close directive

`ClosePopoverDirective` is exported as `nxrClosePopover` and closes the nearest containing popover when activated.

```html
<ng-template #panelTpl>
  <button type="button" nxrClosePopover>Close</button>
</ng-template>
```

By default it closes on click (programmatic close reason path).

## Internal structure

`src/lib/`: **directives/** (popover-trigger, close-popover), **host/** (popover-content-host component). Depends on `@nexora-ui/overlay`.

## Running unit tests

Run `nx test popover` to execute the unit tests.
