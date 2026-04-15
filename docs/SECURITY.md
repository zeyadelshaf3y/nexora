# Security

Security guidance for Nexora headless libraries.

## Trust boundaries

- Library inputs are developer-facing APIs; do not pass untrusted user HTML/attributes directly.
- Consumers own sanitization of remote/user-provided content before passing into templates or library hooks.
- Overlay/content projection does not sanitize arbitrary HTML payloads for you.

## Mention attribute safety

- Mention chip attributes are allowlisted to safe keys:
  - `class`
  - `title`
  - `data-*`
  - `aria-*`
- Dangerous attributes (for example `on*`, `style`, `href`, `src`, unknown keys) are rejected.

## Common secure usage rules

- Prefer plain text insertion paths over raw HTML insertion.
- Keep close/open hooks (`beforeOpen`, `beforeClose`) side-effect free where possible.
- Avoid exposing internal refs/tokens to app code unless required by a documented public API.

## Reporting

If you discover a vulnerability, report it privately to maintainers before public disclosure.
