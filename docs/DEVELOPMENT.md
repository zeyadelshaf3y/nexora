# Development

Quick reference for developing in the Nexora repo: setup, commands, and where to look.

## Setup

- **Node**: Use the version in `.nvmrc` (or project docs). `nvm use` if using nvm.
- **Install**: `npm ci` in CI; locally `npm install` (see `package-lock.json`).

## Commands

| Task                      | Command                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Demo app                  | `nx run demo:serve`                                                                                                                   |
| Unit tests (all headless) | `nx run-many -t test -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,select,combobox,menu,mention` |
| Unit tests (one lib)      | `nx test overlay` (or `tooltip`, `snackbar`, etc.)                                                                                    |
| Lint (all)                | `nx run-many -t lint`                                                                                                                 |
| Lint (one project)        | `nx run overlay:lint`                                                                                                                 |
| Build (all)               | `nx run-many -t build`                                                                                                                |
| Format                    | `npm run format` (Prettier)                                                                                                           |

## Where to find things

- **Overlay engine**: `libs/headless/overlay/src/lib/` — ref, position, scroll, focus, close, portal, events, etc.
- **Dialog/Drawer**: Same lib; `services/dialog.service.ts`, `services/drawer.service.ts`. Options: `lib/types/open-types.ts`.
- **Popover**: `libs/headless/popover/` — directive and host; uses overlay utils.
- **Tooltip**: `libs/headless/tooltip/` — directive, warmup service, host.
- **Snackbar**: `libs/headless/snackbar/` — service, ref, position, options.
- **Core**: `libs/headless/core/src/lib/` — dom, env, events, animation, layout, debug, id.

## Docs (for humans and AI)

- **[HEADLESS.md](HEADLESS.md)** — Libs overview, conventions, public API.
- **[HEADLESS-COMPONENTS-PLAN.md](HEADLESS-COMPONENTS-PLAN.md)** — Roadmap: implemented vs planned overlay-based components.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Dependencies, structure, reuse.
- **[CLEAN-CODE.md](CLEAN-CODE.md)** — Naming, types, tests.
- **[ANGULAR-GUIDELINES.md](ANGULAR-GUIDELINES.md)** — Signals, effects, zoneless, standalone.
- **[PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md)** — What we build, tech stack.
- **[PUBLIC-API-DESIGN.md](PUBLIC-API-DESIGN.md)** — Simple, stable public APIs.
- **[HEADLESS-BEHAVIOR.md](HEADLESS-BEHAVIOR.md)** — Required behavior: overlay engine, anchored primitives, dialog, drawer, popover, tooltip, snackbar, listbox/dropdown and mention pointers.
- **[MENTION.md](../libs/headless/mention/docs/MENTION.md)** — Deep mention integration (blur, mobile, `getItems`).
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** — Focus, ARIA, keyboard, reduced motion, RTL.
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common issues and what to check.
- **[GLOSSARY.md](GLOSSARY.md)** — Terms (anchor, overlay ref, placement, etc.).
- **[TESTING.md](TESTING.md)** — Unit and E2E approach.
- **[API-CONTRACTS.md](API-CONTRACTS.md)** — Stable vs internal APIs.
- **[MIGRATION.md](MIGRATION.md)** — Upgrades and breaking changes.
- **[PERFORMANCE.md](PERFORMANCE.md)** — Performance notes.
- **[SECURITY.md](SECURITY.md)** — Security boundaries (e.g. mention chips).

## Hooks and quality

- **Husky**: Pre-commit (e.g. lint-staged, format), commit-msg (commitlint), pre-push (optional).
- **Commit messages**: Conventional commits (see commitlint config).

When adding a feature or fixing a bug, run the relevant tests and lint for the touched projects.

## Package README vs `src/index.ts`

When adding or renaming **public** exports from a headless package, keep the package **README** and [API-CONTRACTS.md](API-CONTRACTS.md) aligned: anything exported from the root `src/index.ts` should be documented or clearly marked as advanced. Secondary entrypoints (`ng-package.json` **exports**, e.g. `@nexora-ui/overlay/internal`) must match the contracts table.

## Tree-shaking verification

To verify that overlay-based libs tree-shake correctly (e.g. dialog/drawer not pulled in when only using tooltip): build a minimal app that imports only `@nexora-ui/tooltip`, run a production build, and search the output bundle for `DialogService` or `DrawerService`; they should be absent. See [ARCHITECTURE.md](ARCHITECTURE.md#tree-shaking-and-overlay).

## Adding a new headless library

1. **Generate the lib** (Nx Angular): e.g. `nx g @nx/angular:library my-lib --directory=libs/headless/my-lib --standalone --buildable --publishable --importPath=@nexora-ui/my-lib --no-interactive` (adjust flags to your Nx version and conventions).
2. **Set dependencies**: In the new lib’s `project.json` / `tsconfig`, depend only on `@nexora-ui/core` and, if needed, `@nexora-ui/overlay`. No circular deps; see [ARCHITECTURE.md](ARCHITECTURE.md).
3. **Structure**: Create domain folders under `src/lib/` (e.g. `directives/`, `services/`, `ref/`). One barrel `index.ts` per folder; single public entry in `src/index.ts`. See existing libs (e.g. tooltip, snackbar) for layout.
4. **Document**: Add a README in the lib (`libs/headless/my-lib/README.md`) with purpose, usage, and API. Add the lib to the table in [HEADLESS.md](HEADLESS.md) and, if it’s an overlay consumer, to [HEADLESS-BEHAVIOR.md](HEADLESS-BEHAVIOR.md). Update [PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md) and this doc list.
5. **Tests and lint**: Add unit tests; run `nx test my-lib` and `nx run my-lib:lint`. Add to the “all headless” commands in HEADLESS.md and DEVELOPMENT.md (e.g. `-p core,overlay,...,my-lib`).
