/**
 * CSS selector for elements that can receive focus (native focusable + positive tabindex).
 * Use with querySelector/querySelectorAll to find focusable nodes. Does not account for
 * disabled, hidden, or negative tabindex—filter those in calling code if needed.
 */
export const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
