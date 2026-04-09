/**
 * Clamps a number between min and max (inclusive). Pure; no DOM or environment access.
 *
 * @param value - Value to clamp
 * @param min - Minimum (inclusive)
 * @param max - Maximum (inclusive)
 * @returns value when min <= value <= max, else min or max
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;

  return value;
}
