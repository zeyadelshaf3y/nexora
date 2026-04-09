# Accessibility

Accessibility requirements and patterns for Nexora headless components. Use this when implementing or changing overlay, dialog, drawer, popover, tooltip, snackbar, listbox-driven pickers, or **mention** behavior so we stay consistent and inclusive.

## Principles

- **Keyboard**: All interactive overlays must be openable and closable via keyboard. No mouse-only behavior for core flows.
- **Focus**: Focus is managed on open/close (move into overlay, restore on close). Avoid focus traps only when the overlay is explicitly non-modal (e.g. tooltip).
- **ARIA**: Roles, labels, and relationships are set so screen readers announce state and structure correctly.
- **Motion**: Respect `prefers-reduced-motion` so users can avoid unnecessary animation.

## Focus

- **On open (modal)**: Move focus to the first focusable element inside the pane (dialog, drawer). Use the overlay’s default focus strategy or a focus trap so Tab stays within the overlay.
- **On close**: Restore focus to the element that had focus before open (trigger or last focused). The overlay engine does this by default.
- **Tooltips / non-modal**: Do not move focus into the tooltip. Focus stays on the trigger; tooltip is supplementary. Ensure focus trigger opens the tooltip so keyboard users get the same content.
- **Focus trap**: Use the interactions lib’s focus trap directive for modal content (dialog, drawer). Ensures Tab/Shift+Tab cycle within the overlay until closed.

## ARIA by component

| Component                              | Trigger / container                                                          | Pane                                                                                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dialog**                             | —                                                                            | `role="dialog"`, `aria-modal="true"`. Consumer sets `aria-label` or `aria-labelledby`.                                                                                                                                                                           |
| **Drawer**                             | —                                                                            | Same as dialog.                                                                                                                                                                                                                                                  |
| **Popover**                            | `aria-expanded`, `aria-haspopup="true"`, `aria-controls` (pane id when open) | Stable id, `role="dialog"` (or override for listbox/combobox).                                                                                                                                                                                                   |
| **Tooltip**                            | `aria-describedby` (pane id when open)                                       | `role="tooltip"`, stable id. Content should be short and descriptive.                                                                                                                                                                                            |
| **Snackbar**                           | —                                                                            | Consumer can set `role="status"` or `role="alert"` and live region as needed.                                                                                                                                                                                    |
| **Select / Combobox / Menu (listbox)** | Roles per listbox/menu patterns; trigger labels                              | Listbox roles and `aria-activedescendant` / option ids—see [listbox README](../libs/headless/listbox/README.md), [DROPDOWNS.md](DROPDOWNS.md), [HEADLESS-BEHAVIOR.md](HEADLESS-BEHAVIOR.md).                                                                     |
| **Mention**                            | Contenteditable + panel; set `aria-label` on editor if needed                | Panel options should be keyboard-activatable buttons or links; **keyboard** and **screen reader** behavior depend on editor markup. Deep guidance: [MENTION.md](../libs/headless/mention/docs/MENTION.md), [mention README](../libs/headless/mention/README.md). |

- **aria-controls**: Must point to the pane’s id when the overlay is open; omit or clear when closed.
- **aria-expanded**: `true` when open, `false` when closed. Required for triggers that open popovers/menus.
- **Live regions**: For transient messages (e.g. snackbar), consumer may use `aria-live="polite"` or `"assertive"` and `aria-atomic` so screen readers announce the message.

## Keyboard

- **Escape**: Closes the top overlay. Documented in close policy; do not override without good reason.
- **Dialog / drawer**: Focus trap keeps Tab inside; Escape closes. Enter/Space on buttons follow normal button behavior.
- **Popover (click trigger)**: Enter/Space on trigger toggles; Escape closes. When open, focus can move into pane (e.g. listbox) and keyboard follows that context.
- **Tooltip**: Focus on trigger opens; blur closes. No focus inside tooltip. Ensure trigger is focusable (e.g. button, or `tabindex="0"` with proper role).
- **Anchored panels (listbox, combobox, menu)**: Arrow keys move highlight; Enter selects (or activates); Escape closes. See each package README and [DROPDOWNS.md](DROPDOWNS.md) for select/combobox specifics.
- **Clear controls (Select / Combobox)**: When the clear is inside the trigger (e.g. select), use a non-button element with `role="button"`, `tabindex="0"`, and `aria-label` (e.g. "Clear" / "Clear all") so it is focusable and announced. The directive handles Enter/Space to clear and then moves focus to the trigger (select) or next sibling (combobox). Focus order stays logical: trigger → clear (when visible) → next control.
- **Mention**: Focus remains in the **contenteditable** surface; the suggestion panel is a non-modal overlay. Ensure the editor has an accessible name (`aria-label` / `aria-labelledby`) when there is no visible label. Prefer **`mousedown`** on suggestions so selection completes before blur (see [MENTION.md](../libs/headless/mention/docs/MENTION.md)). Chip markup must stay within the attribute allowlist in [SECURITY.md](SECURITY.md).

## Reduced motion

- **CSS**: Prefer `prefers-reduced-motion: reduce` in styles (e.g. shorter or no transition for open/close). The overlay sets `data-placement` and `data-state`; consumer can do: `@media (prefers-reduced-motion: reduce) { ... }`.
- **JS**: Avoid forcing long animations when the user prefers reduced motion. Core’s `prefersReducedMotion()` (if used) or CSS-only handling is sufficient for overlay open/close.

## RTL

- **Native support**: RTL is supported without any extra configuration. Direction is resolved from the anchor or document via `getResolvedDir` from `@nexora-ui/core`.
- **Placement**: `start` and `end` follow document or anchor `dir`. Dialog, drawer, popover, tooltip, and snackbar placements are RTL-aware (start/end flip).
- **Positioning**: Position strategies use the same placement names; layout logic flips so “start” is right in RTL when appropriate.

- **Listbox**: Horizontal listboxes flip ArrowLeft/ArrowRight in RTL so keyboard navigation matches visual order.

## Testing a11y

- **Unit tests**: Assert that ARIA attributes and pane ids are set when open and cleared or updated when closed. Assert focus restore when possible (e.g. mock document.activeElement).
- **E2E**: Add keyboard flows (Tab, Escape, Enter) and, if possible, run with a screen reader or axe. Manual check for focus order and live region announcements is recommended for new components.
- **Linting**: Use Angular ESLint a11y rules where enabled; fix template issues (e.g. missing labels, focusable elements).

## Summary

- Focus: move in on open (modal), restore on close; tooltips do not take focus.
- ARIA: roles and relationships per component; consumer supplies labels where needed.
- Keyboard: Escape closes; triggers are keyboard-activatable; list-like overlays get arrow/Enter behavior.
- Reduced motion and RTL: respect via CSS and existing placement logic.
