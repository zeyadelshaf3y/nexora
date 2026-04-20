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

## Running tests (summary)

```bash
# Unit: all headless libs
nx run-many -t test -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,select,menu,combobox,mention

# Unit: single lib
nx test overlay
```

When implementing a feature or fixing a bug, add or update relevant unit tests so behavior is documented and regressions are caught.
