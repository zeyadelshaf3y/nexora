# Testing

How we test the Nexora headless libraries and demo app. Use this when adding tests or debugging failures.

## Unit tests

- **Framework**: Vitest (primary) and Angular unit-test executor where configured.
- **Location**: Spec file next to source: `*.spec.ts` (e.g. `overlay-ref-impl.spec.ts`).
- **Run**: Per project: `nx test <project>`. All headless libs: `nx run-many -t test -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,select,menu,combobox,mention`.
- **Coverage**: Run with coverage if the project is configured (e.g. `nx test overlay --codeCoverage`). Prefer testing behavior and contracts rather than chasing 100% line coverage.

### What to test

- **Services**: Open/close behavior, options passed through, ref returned, `afterClosed` emission. Mock dependencies (e.g. OverlayService) when testing DialogService/DrawerService.
- **Directives**: Trigger opens/closes overlay; inputs affect config; outputs emit; state (e.g. `isOpen`) updates. Use a test host component and fixture.
- **Position strategies**: Given context (viewport, anchor rect, placement), output position/size is correct. Pure logic; no DOM.
- **Utils**: Pure functions: same inputs → same outputs. Edge cases (null, empty, RTL).

### What to avoid

- Testing Angular or third-party APIs.
- Brittle DOM or selector-based tests when behavior can be asserted via refs/emissions.
- Large, slow specs; split or focus on the critical path.

## E2E tests

- **Framework**: Playwright (demo-e2e app).
- **Location**: `apps/demo-e2e/`. Specs in `src/` (e.g. `overlay.spec.ts`, `menu.spec.ts` — includes menu scroll-strategy checks, `select-combobox.spec.ts` — select/combobox flows and `disable()` closing, `mention.spec.ts`, tooltip specs).
- **Run**: `npx playwright install` once (browser binaries), then `nx run demo-e2e:e2e`. For a single browser: `nx run demo-e2e:e2e --project=chromium`. Mention-only: `cd apps/demo-e2e && npx playwright test src/mention.spec.ts --project=chromium`.
- **URLs**: Use paths relative to Playwright **`baseURL`** (see `apps/demo-e2e/playwright.config.ts`, default `http://localhost:4200`). In specs, prefer `page.goto('/listbox')` instead of hard-coding the full origin. Override the origin with env **`BASE_URL`** when testing against a deployed build.
- **Traces**: To debug flakiness or layout, run with `--trace=on` and open the zip: `npx playwright show-trace <path-to-trace.zip>`.
- **Demo app**: Must be running or started by the E2E config for tests that load the app.

### What to test

- Critical user flows: open dialog/drawer/popover/tooltip/snackbar, close via Escape/backdrop/button, focus and keyboard where relevant.
- Visual or layout regressions only if the project uses screenshot/layout assertions; prefer behavior (visibility, close, refs).

## Running tests (summary)

```bash
# Unit: all headless libs
nx run-many -t test -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,select,menu,combobox,mention

# Unit: single lib
nx test overlay

# E2E (after playwright install)
nx run demo-e2e:e2e
```

When implementing a feature or fixing a bug, add or update the relevant unit (and E2E if user-facing) so behavior is documented and regressions are caught.
