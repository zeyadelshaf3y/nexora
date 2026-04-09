# Clean Code Guidelines

Conventions for naming, formatting, and organizing code so the codebase stays readable and consistent. Apply these when implementing features or fixing bugs.

## Naming

- **Files**: kebab-case. One main symbol per file when it’s a directive, component, or service (e.g. `tooltip-trigger.directive.ts`, `dialog.service.ts`). Specs: `*.spec.ts` next to the source file.
- **Types and interfaces**: PascalCase. Prefer `interface` for object shapes; use `type` for unions, mapped types, and aliases.
- **Functions and methods**: camelCase. Use verbs for actions (`open`, `close`, `applyPosition`). Getters/predicates can be `isOpen`, `hasBackdrop`, `shouldClose`.
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g. `DEFAULT_CLOSE_ANIMATION_MS`). Config objects can be camelCase.
- **Private fields**: Prefix with `private readonly` when the reference is immutable; name in camelCase. No underscore prefix unless the codebase already uses it consistently in that file.
- **Angular**: Inputs/outputs follow the lib prefix (e.g. `nxrTooltip`, `nxrPopoverPlacement`). Directive selectors: `[nxrTooltip]`, `[nxrPopover]`.

## Functions and methods

- **Small and focused**: One level of abstraction per function. If a function does “open overlay, apply config, attach listeners,” consider splitting or naming the steps clearly.
- **Options object**: For more than two or three parameters, use a single options object (e.g. `open(content, options)`). Document optional vs required in the type or JSDoc.
- **Return types**: Explicit return types on public APIs and when the type is non-obvious. Use `void` for fire-and-forget; use `Promise<T | null>` when the operation can fail or be cancelled.
- **Async**: Prefer `async/await` over raw `.then()`. Use `Promise` for one-off open/close; use `Observable` for streams (e.g. `afterClosed()`).

## Types and contracts

- **Prefer interfaces for public contracts**: `OverlayRef`, `OverlayConfig`, `SnackbarOpenOptions`. Implementation can be a class that implements the interface.
- **Use `readonly`**: On option and config types, mark properties `readonly` so callers don’t mutate shared objects.
- **Avoid `any`**: Use `unknown` and narrow, or generic types. For Angular templates, use proper typing for `TemplateRef<T>`, `ViewContainerRef`, etc.
- **JSDoc for public API**: Document purpose, parameters, return value, and notable behavior (e.g. “returns null if opening was cancelled by beforeOpen”). No need to repeat the type in prose.

## Organization within a file

- **Order**: Imports (Angular, then libs, then relative), then types/interfaces, then constants, then the main class or functions. Put private helpers below the main export.
- **Grouping**: Group related logic (e.g. “open”, “close”, “listeners”). Use short section comments if the file is long (e.g. `/* ═══ Position application ═══ */`).
- **Barrel files**: Only re-export. No logic, no default exports. Use `export type { X }` for type-only exports where appropriate.

## Error handling and guards

- **Guards**: Check preconditions at the start (e.g. “already closed”, “missing anchor”) and return early or return a safe value (`null`, `false`).
- **No silent failures**: When something cannot be done (e.g. overlay open cancelled), return `null` or a result type and let the caller decide. Use `warnOnce` or similar for unexpected but recoverable cases if the codebase already does.
- **Invariants**: Use `invariant()` from core for “this must never happen” checks in development; avoid in hot paths.

## Tests

- **Descriptive specs**: Use “should …” or “when … it …” style. One behavior per `it` when possible.
- **Arrange–Act–Assert**: Set up, call the unit under test, assert. Avoid large blocks of setup that obscure the tested behavior.
- **No logic in tests**: Tests should be obvious; avoid complex helpers or shared mutable state. Prefer small, focused fixtures.

## Formatting and tooling

- **Prettier**: Use project Prettier config. No manual formatting fights (e.g. line length, quotes).
- **ESLint**: Fix lint errors; do not disable rules without a short comment and a good reason.
- **Imports**: Prefer type-only imports when only types are used: `import type { X } from '...'`. Group and sort per project conventions.

## Documentation in code

- **Public API**: JSDoc on exported symbols (services, directives, interfaces used in public options). Describe “what” and “when,” not the obvious “what the parameter is” from the type.
- **Non-obvious logic**: Short inline comments for “why” (e.g. RTL flip, stack order). No comments that repeat the code.
- **TODOs**: Use `// TODO: …` with context or ticket if needed; avoid long-term TODOs without an owner or ticket.

## Consistency with existing code

- When touching a file, match the existing style (naming, structure, use of signals vs RxJS in that lib). When adding a new pattern, align with the rest of the lib (e.g. overlay uses option objects and `readonly`; follow that).
