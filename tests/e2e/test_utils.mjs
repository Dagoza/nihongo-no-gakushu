/**
 * ==============================================================================
 * NIHONGO MASTER - E2E TEST UTILITIES & CONTRACT ANALYZERS
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

export const ROOT_DIR = path.resolve(process.cwd());
export const APP_DIR = path.join(ROOT_DIR, 'app');
export const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

/**
 * Custom Assertion Wrapper
 */
export function testAssert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Calculate Relative Luminance of a HEX color (sRGB standard)
 */
export function hexToLuminance(hex) {
  const cleanHex = hex.replace('#', '').trim();
  let r, g, b;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  } else {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculate WCAG Contrast Ratio between two HEX colors
 * (L1 + 0.05) / (L2 + 0.05) where L1 is lighter than L2
 */
export function calculateContrastRatio(hex1, hex2) {
  const lum1 = hexToLuminance(hex1);
  const lum2 = hexToLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse CSS Custom Properties from globals.css
 */
export function parseCssVariables(cssContent) {
  const rootVars = new Map();
  const darkVars = new Map();

  // Parse :root
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
  if (rootMatch) {
    const lines = rootMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/--([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/);
      if (match) {
        rootVars.set(`--${match[1].trim()}`, match[2].trim());
      }
    }
  }

  // Parse [data-theme="dark"]
  const darkMatch = cssContent.match(/\[data-theme=["']?dark["']?\]\s*\{([^}]+)\}/);
  if (darkMatch) {
    const lines = darkMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/--([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/);
      if (match) {
        darkVars.set(`--${match[1].trim()}`, match[2].trim());
      }
    }
  }

  return { rootVars, darkVars };
}

/**
 * Check if file contains specific pattern
 */
export function fileContains(filePath, pattern) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf-8');
  if (pattern instanceof RegExp) {
    return pattern.test(content);
  }
  return content.includes(pattern);
}

/**
 * Reads file content safely
 */
export function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}
