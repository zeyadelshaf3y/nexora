# Angular Guidelines and Best Practices

Nexora targets **Angular 21** (standalone APIs, signal inputs, modern control flow). Prefer the patterns below so the codebase stays consistent, testable, and aligned with the framework’s direction.

## Signals

- **State in directives and components**: Prefer **signals** for local UI state (e.g. `isOpen`, `paneId`, `highlightedIndex`). Use `signal()`, `computed()`, and `effect()` instead of RxJS when the logic is synchronous and local.
- **Inputs**: Use **signal inputs** for new directives and components: `input()`, `input.required()`, `model()` where two-way binding is needed. Legacy `@Input()` is acceptable when migrating or when signal inputs are not suitable.
- **Outputs**: Prefer **output()** over `@Output()` and `EventEmitter` for new code. Use for directive/component events (e.g. `opened`, `closed`).
- **Computed**: Use **computed()** for derived state that depends on signals (e.g. `isDisabled = computed(() => !this.isOpen() && this.loading())`. Keeps updates reactive and avoids manual subscriptions.
- **linkedSignal** (Angular 19+): Use when you need a signal that stays in sync with an external source or another signal in a specific way. Prefer over manual `effect()` + `set()` when the relationship is “mirror this value.”
- **When to use RxJS**: Keep RxJS for streams that are inherently async or multi-source: `afterClosed()`, HTTP, router events, or when you need operators (e.g. `debounceTime`, `switchMap`). Do not replace every `Observable` with signals; use the right tool per use case.

## Effects

- **Side effects**: Use **effect()** for side effects that depend on signals (e.g. sync DOM, update attributes, call a callback when `isOpen()` changes). Run outside of the current stack when the effect only reads signals and updates non-signal state.
- **Cleanup**: Effects can return a cleanup function. Use it to remove listeners, cancel timeouts, or unsubscribe so there are no leaks when the directive/component is destroyed.
- **Avoid writes in effects**: Prefer not to write to signals inside an effect when that write could trigger the same or another effect (risk of loops). If you must, use a flag or batch updates carefully.
- **Zoneless**: Effects run in the signal graph; they do not depend on Zone.js. Prefer effects for reactive side effects so the app is ready for zoneless.

## Zoneless and change detection

- **Zoneless-ready**: Prefer signals and `effect()` so that components and directives do not rely on Zone.js for updates. Avoid `setTimeout`/`setInterval` for change detection; use signals and effects or RxJS.
- **OnPush**: Use `ChangeDetectionStrategy.OnPush` for components. With signals and async pipe, OnPush is sufficient; avoid `markForCheck()` or `detectChanges()` unless interfacing with legacy code.
- **Async pipe**: Prefer `async` pipe for `Observable` in templates so subscription and unsubscribe are automatic. For signals, use the signal directly in the template (no pipe).

## Dependency injection

- **inject()**: Prefer **inject()** in constructors or field initializers over constructor parameters for DI. Use for services, `ElementRef`, `ViewContainerRef`, and tokens. Keeps constructors short and makes optional injection and tokens clearer.
- **providedIn**: Use `providedIn: 'root'` for stateless services that are used app-wide (e.g. `DialogService`, `SnackbarService`). Use a specific provider (e.g. `providedIn: NgModule` or component) when the service must be scoped.
- **Tokens**: Use `InjectionToken` for config (e.g. `OVERLAY_BASE_Z_INDEX`). Document default and usage in the token’s comment.

## Templates and bindings

- **Control flow**: Use **@if**, **@for**, **@switch** in templates instead of `*ngIf`, `*ngFor`, `*ngSwitch` in new code. Migrate when touching existing templates.
- **Signals in templates**: Call signals as functions: `isOpen()`, `paneId()`. Use computed signals for derived values so templates stay simple.
- **Avoid logic in templates**: Keep expressions simple. Move logic to component/directive methods or computed signals.

## Standalone

- **New code**: All new components and directives are **standalone**. Do not add new NgModules for features. Import standalone directives/components where they are used or in a shared standalone array.
- **Libraries**: Publish standalone directives and components; consumers can import them without NgModules.

## Performance

- **TrackBy**: Use `track` in `@for` (e.g. `@for (item of items; track item.id)`) for lists that change. Avoid `track $index` when the list is reordered or filtered.
- **Lazy loading**: Use dynamic imports for heavy or route-scoped features. Overlay and headless libs are tree-shakable; import only what you use.

## Accessibility

- **ARIA**: Set `role`, `aria-expanded`, `aria-controls`, `aria-describedby`, `aria-label` / `aria-labelledby` as appropriate. Overlay and directives already set many of these; preserve or extend them when changing behavior.
- **Focus**: Restore focus on close (overlay default focus strategy). Use focus trap for modal overlays (dialog, drawer). Ensure tooltips and popovers are keyboard-accessible (e.g. focus trigger to open).
- **Reduced motion**: Respect `prefers-reduced-motion` in CSS or when choosing animation duration. Do not rely only on JavaScript for this.

## Summary checklist for new code

- [ ] Use signals for local UI state; signal inputs/outputs for new directives and components.
- [ ] Use `computed()` for derived state; `effect()` for side effects that depend on signals.
- [ ] Prefer `inject()` and standalone components/directives.
- [ ] Use `@if` / `@for` / `@switch` in templates; call signals as functions.
- [ ] OnPush; avoid Zone-based change detection for new code.
- [ ] Keep the codebase zoneless-ready (signals + effects, minimal reliance on Zone).
