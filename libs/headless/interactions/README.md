# @nexora-ui/interactions

Headless interaction primitives for Nexora UI. Currently: focus trap for modals (dialogs, drawers).

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)). Focus order and trapping relate to [ACCESSIBILITY.md](../../../docs/ACCESSIBILITY.md).

## Installation

```bash
npm install @nexora-ui/interactions
```

## Focus trap

**nxrFocusTrap** — Keeps keyboard focus within the host. On Tab / Shift+Tab, focus wraps between the first and last focusable element. Use on modal containers to meet WCAG 2.4.3 (Focus Order).

### Usage

```html
<div nxrFocusTrap>
  <button>First</button>
  <input />
  <button>Last</button>
</div>
```

- **nxrFocusTrapEnabled** (default `true`): set to `false` to disable trapping (e.g. when modal is closing).
- Only **visible, enabled** elements with positive tabindex or native focusable roles are considered. Hidden and `disabled` elements are skipped.

## API

| Directive/Input       | Type      | Default | Description                                      |
| --------------------- | --------- | ------- | ------------------------------------------------ |
| `nxrFocusTrap`        | directive | enabled | Activates focus trapping on the host.            |
| `nxrFocusTrapEnabled` | `boolean` | `true`  | Toggles trapping without removing the directive. |

### Accessibility

The directive does not manage focus on open/close; pair it with an overlay focus strategy (e.g. overlay’s default: focus first focusable on open, restore previous on close). The trap ensures that once focus is inside, it cannot leave until the user closes the overlay.

## Behavior and limitations

- Focus trap only handles keyboard focus containment (`Tab` / `Shift+Tab`) inside the host.
- It does not decide initial focus target on open and does not close the overlay on `Escape`.
- For nested overlays, each layer should own its own trap scope and close behavior.

## Running unit tests

Run `nx test interactions` to execute the unit tests.
