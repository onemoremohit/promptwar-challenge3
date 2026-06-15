// src/utils/sanitizer.ts

/**
 * Sanitizes and cleans text strings to prevent script injection or cross-site scripting (XSS).
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  // Strip HTML elements/tags
  return val.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validates and sanitizes numeric input fields.
 * Prevents NaN corruption, negative numbers, or extremely large numbers to avoid overflow.
 */
export function sanitizeNumber(val: any, min = 0, max = 1000000): number {
  let num = Number(val);
  if (isNaN(num)) return min;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}
