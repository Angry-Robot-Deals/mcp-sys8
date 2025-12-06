/**
 * Color conversion utilities
 */

export interface ConvertColorArgs {
  input: string;
  from: 'hex' | 'rgb' | 'hsl';
  to: 'hex' | 'rgb' | 'hsl';
}

export interface ConvertColorResult {
  input: string;
  from: string;
  to: string;
  hex: string;
  rgb: string;
  hsl: string;
  rgb_array: [number, number, number];
  hsl_array: [number, number, number];
}

/**
 * Convert between color formats (hex, RGB, HSL)
 */
export function convertColor(args: ConvertColorArgs): ConvertColorResult {
  const { input, from, to } = args;

  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  // Normalize input
  const normalizedInput = input.trim();

  // Parse input color based on 'from' format
  let r: number, g: number, b: number;

  try {
    switch (from) {
      case 'hex':
        ({ r, g, b } = parseHex(normalizedInput));
        break;
      case 'rgb':
        ({ r, g, b } = parseRgb(normalizedInput));
        break;
      case 'hsl':
        ({ r, g, b } = parseHsl(normalizedInput));
        break;
      default:
        throw new Error(`Unknown source format: ${from}`);
    }
  } catch (error) {
    throw new Error(`Failed to parse ${from} color: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Convert to all formats
  const hex = rgbToHex(r, g, b);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hsl = rgbToHsl(r, g, b);
  const rgbArray: [number, number, number] = [r, g, b];
  const hslArray = hslStringToArray(hsl);

  return {
    input: normalizedInput,
    from,
    to,
    hex,
    rgb,
    hsl,
    rgb_array: rgbArray,
    hsl_array: hslArray,
  };
}

/**
 * Parse hex color (#RRGGBB or RRGGBB)
 */
function parseHex(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Validate hex format
  if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) {
    throw new Error('Invalid hex format. Expected #RRGGBB or RRGGBB');
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Parse RGB color (rgb(255, 255, 255) or 255, 255, 255)
 */
function parseRgb(rgb: string): { r: number; g: number; b: number } {
  // Match rgb(r, g, b) or r, g, b format
  const match = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$|^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);

  if (!match) {
    throw new Error('Invalid RGB format. Expected rgb(r, g, b) or r, g, b');
  }

  const r = parseInt(match[1] || match[4], 10);
  const g = parseInt(match[2] || match[5], 10);
  const b = parseInt(match[3] || match[6], 10);

  // Validate range
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error('RGB values must be between 0 and 255');
  }

  return { r, g, b };
}

/**
 * Parse HSL color (hsl(360, 100%, 50%) or 360, 100, 50)
 */
function parseHsl(hsl: string): { r: number; g: number; b: number } {
  // Match hsl(h, s%, l%) or h, s, l format
  const match = hsl.match(/^hsl\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$|^(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)$/);

  if (!match) {
    throw new Error('Invalid HSL format. Expected hsl(h, s%, l%) or h, s, l');
  }

  let h = parseFloat(match[1] || match[4]);
  let s = parseFloat(match[2] || match[5]);
  let l = parseFloat(match[3] || match[6]);

  // Normalize values
  h = h % 360;
  if (s > 1) s = s / 100;
  if (l > 1) l = l / 100;

  // Validate range
  if (h < 0 || h >= 360 || s < 0 || s > 1 || l < 0 || l > 1) {
    throw new Error('HSL values out of range: h (0-360), s (0-100% or 0-1), l (0-100% or 0-1)');
  }

  // Convert HSL to RGB
  return hslToRgb(h, s, l);
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h / 360 + 1 / 3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert HSL string to array
 */
function hslStringToArray(hsl: string): [number, number, number] {
  const match = hsl.match(/^hsl\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)$/);
  if (!match) {
    throw new Error('Invalid HSL string format');
  }
  return [
    parseFloat(match[1]),
    parseFloat(match[2]),
    parseFloat(match[3]),
  ];
}
