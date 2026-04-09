# @nexora-ui/tooltip

Headless tooltip directive: shows a tooltip overlay anchored to the host on hover or focus. Uses the overlay system for positioning, viewport clamping, and optional arrow. No focus trap (tooltips are supplementary). Tree-shakable.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## Usage

```html
<button nxrTooltip="Save changes">💾</button>

<button
  nxrTooltip="Delete item"
  nxrTooltipPlacement="bottom"
  [nxrTooltipDisplayArrow]="true"
  [nxrTooltipOpenDelay]="300"
>
  🗑️
</button>
```

## Accessibility

- The trigger gets **aria-describedby** pointing to the tooltip pane id when open.
- The tooltip pane gets **role="tooltip"** and a stable id. Ensure the referenced content is descriptive (e.g. short, clear text).
- For **hover**: consider `nxrTooltipOpenDelay` so accidental passes don’t open; **focus** ensures keyboard users get the same content.

## RTL

Placement and positioning use the overlay’s RTL handling: **start**/ **end** and 12-position placements follow the anchor’s (or document’s) `dir`.

## API (main inputs)

| Input                                | Default              | Description                                         |
| ------------------------------------ | -------------------- | --------------------------------------------------- |
| `nxrTooltip`                         | required             | Tooltip text.                                       |
| `nxrTooltipPlacement`                | `'top'`              | Preferred placement (RTL-aware).                    |
| `nxrTooltipTrigger`                  | `['hover', 'focus']` | When to open.                                       |
| `nxrTooltipDisplayArrow`             | `true`               | Show arrow.                                         |
| `nxrTooltipOpenDelay`                | `200`                | Ms before opening (skipped during warm-up).         |
| `nxrTooltipCloseDelay`               | `0`                  | Ms before closing.                                  |
| `nxrTooltipHoverCloseDelay`          | `100`                | Used when close delay not set.                      |
| `nxrTooltipFocusCloseDelay`          | `undefined`          | Focus-specific close delay fallback.                |
| `nxrTooltipInstantOnHandoff`         | `true`               | Instant open when moving directly between tooltips. |
| `nxrTooltipAllowContentHover`        | `false`              | Hovering tooltip content keeps it open.             |
| `nxrTooltipCloseAnimationDurationMs` | `150`                | Close animation duration in ms.                     |
| `nxrTooltipClampToViewport`          | `false`              | Clamp to viewport vs follow anchor.                 |
| `nxrTooltipScrollStrategy`           | `'noop'`             | `'noop'` or `'reposition'`.                         |
| `nxrTooltipMaintainInViewport`       | `true`               | Used with reposition strategy.                      |

**State**: `isOpen`, `paneId` (for `aria-describedby`).

### Styling hooks

| Hook                     | Type                                | Applies to       | Notes                                                                    |
| ------------------------ | ----------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `nxrTooltipPanelClass`   | `string \| string[]`                | Overlay pane     | Preferred for reusable themes and animation states.                      |
| `nxrTooltipPanelStyle`   | `Record<string, string>`            | Overlay pane     | Inline one-off pane style overrides.                                     |
| `nxrTooltipPlacement`    | `Placement`                         | Positioning      | Preferred anchor placement (with fallback unless explicitly restricted). |
| `nxrTooltipDisplayArrow` | `boolean`                           | Arrow element    | Shows/hides arrow when using default tooltip host rendering.             |
| `nxrTooltipArrowSize`    | `{ width: number; height: number }` | Arrow element    | Optional custom arrow size in px.                                        |
| `nxrTooltipBoundaries`   | `ViewportBoundaries`                | Reposition logic | Insets used for viewport clamping and max-size calculations.             |

Tooltips do not use a backdrop; there are no `backdropClass` or `backdropStyle` inputs.

### Warmup configuration

By default, tooltip warmup window is disabled (`0ms`), so instant open is only used for direct tooltip-to-tooltip handoff.

You can configure a warmup window globally:

```ts
import { TOOLTIP_WARMUP_CONFIG } from '@nexora-ui/tooltip';

providers: [{ provide: TOOLTIP_WARMUP_CONFIG, useValue: { warmupWindowMs: 500 } }];
```

For programmatic control, `TooltipWarmupService` is exported and can be used to mark a warm session window manually (for custom trigger handoff behavior).

### Global tooltip defaults

You can also set library-wide defaults for tooltip inputs. Directive inputs still win when explicitly provided.

```ts
import { TOOLTIP_DEFAULTS_CONFIG } from '@nexora-ui/tooltip';

providers: [
  {
    provide: TOOLTIP_DEFAULTS_CONFIG,
    useValue: {
      openDelay: 120,
      hoverCloseDelay: 120,
      closeAnimationDurationMs: 120,
      instantOnHandoff: true,
      displayArrow: true,
      scrollStrategy: 'reposition',
      panelClass: 'my-tooltip-pane',
      panelStyle: { maxWidth: '20rem' },
      arrowSize: { width: 14, height: 7 },
      boundaries: { top: 8, right: 8, bottom: 8, left: 8 },
    },
  },
];
```

Exported defaults:

- `DEFAULT_TOOLTIP_DEFAULTS_CONFIG` — baseline directive defaults.
- `DEFAULT_TOOLTIP_WARMUP_CONFIG` — baseline warmup service configuration.

## Internal structure

`src/lib/`: **directives/** (tooltip-trigger), **services/** (tooltip-warmup), **host/** (tooltip-content-host component). Depends on `@nexora-ui/overlay`.

## Running unit tests

Run `nx test tooltip` to execute the unit tests.
