/**
 * Number formatting utilities
 */

export interface FormatNumberArgs {
  number: number;
  format: 'currency' | 'percentage' | 'thousands' | 'decimal';
  locale?: string;
  currency?: string;
  minimum_fraction_digits?: number;
  maximum_fraction_digits?: number;
}

export interface FormatNumberResult {
  input: number;
  formatted: string;
  format: string;
  locale: string;
  currency?: string;
}

/**
 * Format numbers (currency, percentage, thousands separator, decimal)
 */
export function formatNumber(args: FormatNumberArgs): FormatNumberResult {
  const {
    number,
    format,
    locale = 'en-US',
    currency = 'USD',
    minimum_fraction_digits,
    maximum_fraction_digits,
  } = args;

  if (typeof number !== 'number' || !Number.isFinite(number)) {
    throw new Error('Number must be a finite number');
  }

  if (typeof locale !== 'string' || locale.trim().length === 0) {
    throw new Error('Locale must be a non-empty string');
  }

  let formatted: string;
  let options: Intl.NumberFormatOptions = {};

  switch (format) {
    case 'currency':
      if (typeof currency !== 'string' || currency.trim().length === 0) {
        throw new Error('Currency must be a non-empty string for currency format');
      }
      options = {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: minimum_fraction_digits ?? 2,
        maximumFractionDigits: maximum_fraction_digits ?? 2,
      };
      formatted = new Intl.NumberFormat(locale, options).format(number);
      break;

    case 'percentage':
      options = {
        style: 'percent',
        minimumFractionDigits: minimum_fraction_digits ?? 0,
        maximumFractionDigits: maximum_fraction_digits ?? 2,
      };
      formatted = new Intl.NumberFormat(locale, options).format(number / 100);
      break;

    case 'thousands':
      options = {
        useGrouping: true,
        minimumFractionDigits: minimum_fraction_digits ?? 0,
        maximumFractionDigits: maximum_fraction_digits ?? 2,
      };
      formatted = new Intl.NumberFormat(locale, options).format(number);
      break;

    case 'decimal':
      options = {
        minimumFractionDigits: minimum_fraction_digits ?? 0,
        maximumFractionDigits: maximum_fraction_digits ?? 2,
      };
      formatted = new Intl.NumberFormat(locale, options).format(number);
      break;

    default:
      throw new Error(`Unknown format: ${format}. Must be one of: currency, percentage, thousands, decimal`);
  }

  const result: FormatNumberResult = {
    input: number,
    formatted,
    format,
    locale,
  };

  if (format === 'currency') {
    result.currency = currency.toUpperCase();
  }

  return result;
}
