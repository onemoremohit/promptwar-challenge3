// src/utils/sanitizer.ts
/**
 * @file sanitizer.ts
 * @description Input sanitization utilities for the EcoSphere Carbon Hub.
 * Provides XSS-safe string cleaning and numeric boundary enforcement to
 * prevent injection attacks and state corruption in downstream calculations.
 *
 * @module sanitizer
 */

/**
 * Sanitizes a string input by stripping all HTML/XML tags to prevent
 * Cross-Site Scripting (XSS) attacks and broken data mutations in downstream state.
 *
 * Non-string inputs are coerced to an empty string for safety.
 * Leading and trailing whitespace is trimmed from the result.
 *
 * @param val - The raw string value to sanitize
 * @returns A plain-text string with all HTML tags removed and whitespace trimmed
 *
 * @example
 * ```ts
 * sanitizeString('<script>alert("xss")</script>John'); // → 'alert("xss")John' → then trimmed: 'alert("xss")John'
 * sanitizeString('  Alex  ');                          // → 'Alex'
 * sanitizeString(null);                                // → ''
 * ```
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  // Strip all HTML/XML elements to neutralize injection vectors
  return val.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validates and clamps a numeric input to a specified safe range.
 *
 * Prevents NaN corruption, negative overflow, and excessively large values
 * that could cause undefined behaviour in carbon calculation pipelines.
 * Non-numeric inputs are coerced via `Number()` before validation.
 *
 * @param val   - The raw value to validate (any type, coerced to number)
 * @param min   - The minimum allowed value (inclusive). Defaults to `0`.
 * @param max   - The maximum allowed value (inclusive). Defaults to `1_000_000`.
 * @returns A finite number clamped to the `[min, max]` range
 *
 * @example
 * ```ts
 * sanitizeNumber('250', 0, 500);  // → 250
 * sanitizeNumber(-5, 0, 500);     // → 0   (clamped to min)
 * sanitizeNumber(600, 0, 500);    // → 500 (clamped to max)
 * sanitizeNumber(NaN, 0, 500);    // → 0   (NaN → min)
 * sanitizeNumber(undefined);      // → 0   (NaN → default min)
 * ```
 */
export function sanitizeNumber(val: unknown, min = 0, max = 1_000_000): number {
  const num = Number(val);
  if (isNaN(num)) return min;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}
