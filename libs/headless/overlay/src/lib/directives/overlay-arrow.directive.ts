import { Directive, HostBinding } from '@angular/core';

/**
 * Directive that positions an element as the overlay arrow for anchored overlays (e.g. popover).
 *
 * **Usage:** Add `nxrOverlayArrow` to a single element inside your overlay content template.
 * The overlay pane sets CSS variables; this directive applies them so the arrow follows the
 * anchor. Style the host as your arrow shape (e.g. triangle via borders or clip-path).
 *
 * **CSS variables** (set by the overlay; you can use them in custom styles if needed):
 * - `--nxr-arrow-x`, `--nxr-arrow-y`: position (pane-relative, px).
 * - `--nxr-arrow-rotate`: rotation in deg (0, 180, ±90).
 * - `--nxr-arrow-side`: which edge the arrow is on (`top` | `bottom` | `start` | `end`).
 * - `--nxr-arrow-visible`: `visible` or `hidden` (hidden when anchor is out of viewport).
 *
 * **Tree-shaking:** Only import this directive when you use arrows (e.g. in popover templates).
 */
@Directive({
  selector: '[nxrOverlayArrow]',
  standalone: true,
})
export class OverlayArrowDirective {
  @HostBinding('style.position') readonly position = 'absolute';
  @HostBinding('style.left') readonly left = 'var(--nxr-arrow-x)';
  @HostBinding('style.top') readonly top = 'var(--nxr-arrow-y)';
  @HostBinding('style.visibility') readonly visibility = 'var(--nxr-arrow-visible, visible)';
  @HostBinding('style.transform-origin') readonly transformOrigin = 'center';
  @HostBinding('style.transform')
  readonly transform = 'rotate(var(--nxr-arrow-rotate, 0deg))';
  @HostBinding('style.pointer-events') readonly pointerEvents = 'none';
}
