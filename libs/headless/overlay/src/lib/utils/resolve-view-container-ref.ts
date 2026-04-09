import { ViewContainerRef, type Injector } from '@angular/core';

/**
 * Resolves an explicit {@link ViewContainerRef} from open options before calling {@link getFallback}.
 * Order: `viewContainerRef`, then `injector.get(ViewContainerRef, null)`.
 *
 * @internal Shared by {@link OverlayService.open} and sibling packages (e.g. snackbar) via
 * `@nexora-ui/overlay/internal`.
 */
export function resolveViewContainerRefFromExplicitOptions(
  options: { viewContainerRef?: ViewContainerRef | null; injector?: Injector | null },
  getFallback: () => ViewContainerRef | null,
): ViewContainerRef | null {
  if (options.viewContainerRef) return options.viewContainerRef;
  if (options.injector) {
    const vcr = options.injector.get(ViewContainerRef, null);
    if (vcr) return vcr;
  }

  return getFallback();
}
