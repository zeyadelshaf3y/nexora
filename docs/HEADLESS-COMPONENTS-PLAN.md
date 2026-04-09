# Headless components roadmap

Overlay-based features share **@nexora-ui/overlay**, **@nexora-ui/dropdown**, and often **@nexora-ui/listbox**. This document tracks **what ships today** and **what is planned**. For how packages fit together, see [HEADLESS.md](HEADLESS.md).

## Implemented

| Area     | Package               | Documentation                                                                                                                                                     |
| -------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Listbox  | `@nexora-ui/listbox`  | [README](../libs/headless/listbox/README.md)                                                                                                                      |
| Select   | `@nexora-ui/select`   | [README](../libs/headless/select/README.md), [DROPDOWNS.md](DROPDOWNS.md)                                                                                         |
| Combobox | `@nexora-ui/combobox` | [README](../libs/headless/combobox/README.md), [DROPDOWNS.md](DROPDOWNS.md), [COMBOBOX-VS-AUTOCOMPLETE.md](../libs/headless/combobox/COMBOBOX-VS-AUTOCOMPLETE.md) |
| Menu     | `@nexora-ui/menu`     | [README](../libs/headless/menu/README.md)                                                                                                                         |
| Mention  | `@nexora-ui/mention`  | [README](../libs/headless/mention/README.md), [MENTION.md](../libs/headless/mention/docs/MENTION.md)                                                              |

## Planned

| Component / pattern         | Notes                                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Autocomplete                | Often combobox + allowing a value not in the list.                                                                          |
| Command palette             | Searchable command list; optional global shortcut (e.g. Cmd+K).                                                             |
| Mega menu                   | Large nav dropdown with multiple sections.                                                                                  |
| Tiered / nested menus       | Submenus; overlay stack or nested panels.                                                                                   |
| Context menu                | Right-click / long-press at pointer.                                                                                        |
| Menu bar                    | Horizontal bar; keyboard between top-level items.                                                                           |
| Date / time / color pickers | Calendar, time, and color panel primitives + triggers.                                                                      |
| Confirm popup               | Small anchored confirm/cancel.                                                                                              |
| Tree select                 | Hierarchical options.                                                                                                       |
| Cascade select              | Cascading panels (e.g. region → city).                                                                                      |
| PopoverService              | Optional programmatic `open(content, anchor, options)` for anchors without a host directive (e.g. dynamic mention targets). |

## Conventions for new work

Follow [ARCHITECTURE.md](ARCHITECTURE.md), [PUBLIC-API-DESIGN.md](PUBLIC-API-DESIGN.md), [ACCESSIBILITY.md](ACCESSIBILITY.md), and [HEADLESS-BEHAVIOR.md](HEADLESS-BEHAVIOR.md) where overlays are involved.
