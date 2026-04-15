# Performance

Performance checklist for headless libraries.

## Overlay and positioning

- Reposition logic must be throttled/coalesced (`requestAnimationFrame` or equivalent).
- Register per-overlay listeners only while open; always clean up on close/destroy.
- Prefer idempotent open/close guards to avoid duplicate work under rapid interaction.
- **`AnchoredStrategy`** / **`OverlayRefImpl`**: keep reposition scheduling and listener registration aligned with “per overlay while open”; changes here should preserve the teardown guarantees above (see overlay unit tests and `reposition-listeners`).

## Test and verification

- Add regression tests for open/close loops and teardown races.
- Add memory checks for repeated open/close cycles (no listener growth trend).
- Prefer deterministic waits in E2E tests (`expect(...).toBeVisible()`, locator state), avoid broad `waitForTimeout`.

## Practical budgets

- Keep overlay reposition callbacks small and avoid repeated layout thrash.
- Track bundle growth when adding exports; preserve tree-shaking with focused entrypoints.
