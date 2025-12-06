/**
 * Byte formatting utilities
 */

export interface FormatBytesArgs {
  bytes: number;
  format?: 'binary' | 'decimal';
  precision?: number;
}

export interface FormatBytesResult {
  bytes: number;
  formatted: string;
  formatted_decimal?: string;
  kilobytes: number;
  megabytes: number;
  gigabytes: number;
  terabytes: number;
  petabytes: number;
}

// Binary units (1024-based)
const BINARY_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const BINARY_BASE = 1024;

// Decimal units (1000-based)
const DECIMAL_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const DECIMAL_BASE = 1000;

/**
 * Format bytes to human-readable format
 */
export function formatBytes(args: FormatBytesArgs): FormatBytesResult {
  const { bytes, format = 'binary', precision = 2 } = args;

  if (typeof bytes !== 'number' || bytes < 0 || !Number.isFinite(bytes)) {
    throw new Error('Bytes must be a non-negative finite number');
  }

  if (precision < 0 || precision > 10) {
    throw new Error('Precision must be between 0 and 10');
  }

  // Calculate values for both binary and decimal
  const binaryFormatted = formatBytesInternal(bytes, BINARY_BASE, BINARY_UNITS, precision);
  const decimalFormatted = formatBytesInternal(bytes, DECIMAL_BASE, DECIMAL_UNITS, precision);

  // Calculate unit values
  const kilobytes = bytes / BINARY_BASE;
  const megabytes = bytes / (BINARY_BASE * BINARY_BASE);
  const gigabytes = bytes / (BINARY_BASE * BINARY_BASE * BINARY_BASE);
  const terabytes = bytes / (BINARY_BASE * BINARY_BASE * BINARY_BASE * BINARY_BASE);
  const petabytes = bytes / (BINARY_BASE * BINARY_BASE * BINARY_BASE * BINARY_BASE * BINARY_BASE);

  return {
    bytes,
    formatted: binaryFormatted,
    formatted_decimal: decimalFormatted,
    kilobytes: Math.round(kilobytes * 100) / 100,
    megabytes: Math.round(megabytes * 100) / 100,
    gigabytes: Math.round(gigabytes * 100) / 100,
    terabytes: Math.round(terabytes * 100) / 100,
    petabytes: Math.round(petabytes * 100) / 100,
  };
}

/**
 * Internal function to format bytes with a specific base
 */
function formatBytesInternal(
  bytes: number,
  base: number,
  units: string[],
  precision: number
): string {
  if (bytes === 0) {
    return `0 ${units[0]}`;
  }

  const sign = bytes < 0 ? '-' : '';
  const absBytes = Math.abs(bytes);

  // Find the appropriate unit
  let unitIndex = 0;
  let value = absBytes;

  while (value >= base && unitIndex < units.length - 1) {
    value /= base;
    unitIndex++;
  }

  // Format the value with precision
  const formattedValue = value.toFixed(precision).replace(/\.?0+$/, ''); // Remove trailing zeros

  return `${sign}${formattedValue} ${units[unitIndex]}`;
}
