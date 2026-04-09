# Combobox vs autocomplete

**Current state:** The combobox is a **filterable dropdown**: type to filter options, pick from the list. Value is always one of the options (or null / multi array).

**“Autocomplete”** is used in different ways. This doc spells out the difference and what would be needed if you want a separate autocomplete or an autocomplete _mode_.

---

## 1. What the current combobox does

| Aspect        | Behavior                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Value**     | Must be an option (or null / [] in multi). Typed from the list.                                                                             |
| **Input**     | Single: shows selected label when not editing; when typing, shows search and filters list. Multi: input is search-only; selection is chips. |
| **Filter**    | `searchChange` / `search()`; consumer filters options.                                                                                      |
| **Selection** | User picks from the list (click or keyboard). No “custom” value.                                                                            |
| **ARIA**      | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`.                                   |

So today: **input + dropdown list + type-to-filter + choose from list only**. In many design systems this _is_ what they call “autocomplete” (e.g. Material “Autocomplete”). So in **naming only**, the current component could be called either “combobox” or “autocomplete”; the behavior is the same.

---

## 2. When “autocomplete” means something different

Two common extra meanings:

### A. **Strict autocomplete (word completion)**

- One suggestion that **completes the current word** (e.g. email domain, search suggestions).
- UX: inline completion or a single line under the cursor; accept with Tab / Right.
- **Not** a listbox of options; different interaction and often a different component.

**Difference from current combobox:** Different UX and data model (single completion string, not “pick one of N options”). Would be a different primitive, not a small tweak of the combobox.

### B. **Combobox + allow custom / free-text value (“freeSolo”)**

- Same as current combobox (dropdown, type to filter, listbox).
- **Plus:** user can **commit a value that is not in the list** (e.g. “Other”, or a free-typed string).
- Value type might be `T | string` (option or custom string), or you allow adding a “custom” option on the fly.

**Difference from current combobox:** Value can be “something not in the options list”. Everything else (panel, filter, keyboard, ARIA) can stay the same.

---

## 3. Comparison table

| Feature                 | Current combobox            | Autocomplete (free-text)                                   |
| ----------------------- | --------------------------- | ---------------------------------------------------------- |
| Type to filter options  | ✅                          | ✅                                                         |
| Value from list only    | ✅ Yes                      | ❌ No                                                      |
| Allow value not in list | ❌ No                       | ✅ Yes (“custom” / free text)                              |
| Value type              | `T \| null \| readonly T[]` | `T \| string \| null` (or similar)                         |
| Display when custom     | N/A                         | Show the typed string (or a label you assign)              |
| CVA / form value        | Option(s)                   | Option(s) or custom value                                  |
| ARIA                    | combobox + list             | Same; may need `aria-autocomplete="both"` if inline + list |

So the **only behavioral difference** for “autocomplete” in the “combobox + free text” sense is: **allow a committed value that is not in the options list**.

---

## 4. What you’d need for autocomplete (free-text)

If you want “combobox + allow custom value”, you have two main approaches.

### Option 1: Mode on the same component

- Add an input, e.g. `allowCustom` or `freeSolo`.
- When `true`:
  - On Enter (or “Add” action) with no selection or with a “custom” option, treat current **input text** as the value (or emit a “custom value” event and let the parent set value).
  - Value type becomes something like `T | string | null` (or a wrapper type).
- `displayValue` / `accessors`: when value is a string (custom), show that string; when it’s an option, use accessors as now.
- **Comparison:** Need a way to tell “custom string” vs “option T” (e.g. discriminate by type or a separate `isCustomValue` flag).

### Option 2: Separate autocomplete component

- New component (e.g. `nxr-autocomplete`) that composes the same building blocks (input, overlay, listbox) but:
  - Adds “custom value” handling (commit input text as value).
  - Value type and display logic designed for `T | string` from the start.
- Reuse: overlay, listbox, dropdown ref, input directive behavior; only the **value/display/custom** logic differs.

In both cases you’d need to decide:

- How the user commits custom value: **Enter** with no selection? A dedicated “Add …” option? Both?
- Whether custom value is a **string** or a wrapper object (e.g. `{ custom: true, label: string }`).
- How **async search** interacts with custom value (e.g. show “Searching…”, then “No results – use ‘X’ as custom”).
- **ARIA:** Often `aria-autocomplete="both"` if you have both list and inline/custom completion; keep listbox semantics for the list.

---

## 5. Summary

| Question                                                        | Answer                                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Is the current combobox an “autocomplete”?                      | In the “filterable dropdown, pick from list” sense, **yes**. Many systems use the two terms interchangeably. |
| What’s the main functional difference if we add “autocomplete”? | Allowing a **value that is not in the options list** (custom / free text).                                   |
| Can we keep one component?                                      | Yes, by adding an **allowCustom** (or freeSolo) mode and extending value/display/commit logic.               |
| Or a separate component?                                        | Yes: a dedicated autocomplete that reuses overlay/listbox/input but owns “custom value” semantics.           |

So: **current combobox = filterable dropdown, value from list only.** **Autocomplete (in the “free text” sense) = same UX + allow committing a value not in the list.** The implementation gap is that “custom value” handling and possibly a slightly wider value type; the rest (panel, filter, keyboard, ARIA) can stay as is or be shared.
