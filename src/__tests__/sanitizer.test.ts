// src/__tests__/sanitizer.test.ts
/**
 * @file sanitizer.test.ts
 * @description Verification suite for input sanitization utilities.
 * Covers HTML stripping, XSS injection patterns, numeric clamping,
 * type coercion, and boundary value analysis.
 */
import { describe, test, expect } from 'vitest';
import { sanitizeString, sanitizeNumber } from '../utils/sanitizer';

// ─── Suite 1: sanitizeString ──────────────────────────────────────────────────

describe('sanitizeString — HTML and XSS stripping', () => {
  test('should return a clean plain-text string unchanged', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
  });

  test('should strip a simple HTML tag', () => {
    expect(sanitizeString('<b>bold</b>')).toBe('bold');
  });

  test('should strip script injection tags (XSS vector)', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  test('should strip img onerror XSS vector', () => {
    const xssInput = '<img src="x" onerror="alert(1)" />';
    const result = sanitizeString(xssInput);
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror');
  });

  test('should strip nested HTML tags', () => {
    expect(sanitizeString('<div><p>Nested content</p></div>')).toBe('Nested content');
  });

  test('should strip anchor tags while preserving inner text', () => {
    expect(sanitizeString('<a href="http://evil.com">Click me</a>')).toBe('Click me');
  });

  test('should strip style tag delimiters while preserving surrounding text', () => {
    // The sanitizer removes HTML tag syntax via regex; CSS content between style tags
    // is preserved as text (harmless once the tag is stripped from browser context)
    const result = sanitizeString('<style>body{color:red}</style>text');
    expect(result).not.toContain('<style>');
    expect(result).not.toContain('</style>');
    expect(result).toContain('text');
  });

  test('should trim leading and trailing whitespace', () => {
    expect(sanitizeString('   hello world   ')).toBe('hello world');
  });

  test('should return empty string for an empty input', () => {
    expect(sanitizeString('')).toBe('');
  });

  test('should return empty string for non-string input (number)', () => {
    // @ts-expect-error — intentional type violation for edge case testing
    expect(sanitizeString(42)).toBe('');
  });

  test('should return empty string for non-string input (null)', () => {
    // @ts-expect-error — intentional type violation
    expect(sanitizeString(null)).toBe('');
  });

  test('should return empty string for non-string input (undefined)', () => {
    // @ts-expect-error — intentional type violation
    expect(sanitizeString(undefined)).toBe('');
  });

  test('should return empty string for non-string input (object)', () => {
    // @ts-expect-error — intentional type violation
    expect(sanitizeString({ key: 'val' })).toBe('');
  });

  test('should correctly handle a string with no HTML tags', () => {
    const plain = 'Carbon footprint 42.5 tonnes CO2e';
    expect(sanitizeString(plain)).toBe(plain);
  });

  test('should handle multiple sequential HTML tags', () => {
    expect(sanitizeString('<em><strong>eco</strong></em>')).toBe('eco');
  });

  test('should handle self-closing tags', () => {
    expect(sanitizeString('line1<br/>line2')).toBe('line1line2');
  });

  test('should handle malformed/incomplete HTML tags gracefully', () => {
    // Incomplete tag — regex should not crash
    const result = sanitizeString('text<div incomplete');
    expect(typeof result).toBe('string');
  });

  test('should preserve numbers within a string', () => {
    expect(sanitizeString('You emit 5.32 tonnes per year')).toBe('You emit 5.32 tonnes per year');
  });

  test('should preserve special characters not related to HTML', () => {
    expect(sanitizeString('CO₂ & CH₄ emissions!')).toBe('CO₂ & CH₄ emissions!');
  });
});

// ─── Suite 2: sanitizeNumber ──────────────────────────────────────────────────

describe('sanitizeNumber — numeric validation and clamping', () => {
  test('should return the number as-is when within default range', () => {
    expect(sanitizeNumber(500)).toBe(500);
  });

  test('should return the number as-is when at min boundary', () => {
    expect(sanitizeNumber(0)).toBe(0);
  });

  test('should return the number as-is when at max boundary (default 1000000)', () => {
    expect(sanitizeNumber(1000000)).toBe(1000000);
  });

  test('should clamp negative value to default min (0)', () => {
    expect(sanitizeNumber(-10)).toBe(0);
  });

  test('should clamp value above default max to 1000000', () => {
    expect(sanitizeNumber(9999999)).toBe(1000000);
  });

  test('should return min for NaN input', () => {
    expect(sanitizeNumber(NaN)).toBe(0);
  });

  test('should return min for non-numeric string input', () => {
    expect(sanitizeNumber('abc')).toBe(0);
  });

  test('should parse a valid numeric string correctly', () => {
    expect(sanitizeNumber('250')).toBe(250);
  });

  test('should parse a float string and return its numeric value', () => {
    expect(sanitizeNumber('3.14')).toBeCloseTo(3.14, 2);
  });

  test('should clamp to custom min when value is below it', () => {
    expect(sanitizeNumber(-5, 1, 100)).toBe(1);
  });

  test('should clamp to custom max when value exceeds it', () => {
    expect(sanitizeNumber(200, 0, 100)).toBe(100);
  });

  test('should return custom min for NaN when custom min is set', () => {
    expect(sanitizeNumber(NaN, 5, 500)).toBe(5);
  });

  test('should handle value exactly at custom min boundary', () => {
    expect(sanitizeNumber(10, 10, 500)).toBe(10);
  });

  test('should handle value exactly at custom max boundary', () => {
    expect(sanitizeNumber(500, 10, 500)).toBe(500);
  });

  test('should return min for undefined input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(undefined as any)).toBe(0);
  });

  test('should return min for null input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(null as any)).toBe(0);
  });

  test('should return min for boolean true input', () => {
    // true coerces to 1 which is valid ≥0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(true as any)).toBe(1);
  });

  test('should return min for boolean false input', () => {
    // false coerces to 0 which is min
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeNumber(false as any)).toBe(0);
  });

  test('should handle an array that coerces to a single number', () => {
    // [42] coerces to 42 via Number()
    expect(sanitizeNumber([42])).toBe(42);
  });

  test('should clamp commute distance correctly using domain values (0 to 500)', () => {
    expect(sanitizeNumber(-1, 0, 500)).toBe(0);
    expect(sanitizeNumber(300, 0, 500)).toBe(300);
    expect(sanitizeNumber(600, 0, 500)).toBe(500);
  });

  test('should clamp kWh correctly using domain values (0 to 5000)', () => {
    expect(sanitizeNumber(-100, 0, 5000)).toBe(0);
    expect(sanitizeNumber(2000, 0, 5000)).toBe(2000);
    expect(sanitizeNumber(9999, 0, 5000)).toBe(5000);
  });
});
