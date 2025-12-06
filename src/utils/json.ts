/**
 * JSON formatting and validation utilities
 */

export interface FormatJsonArgs {
  input: string;
  action: 'format' | 'validate' | 'minify' | 'prettify';
  indent?: number;
}

export interface FormatJsonResult {
  valid: boolean;
  formatted?: string;
  minified?: string;
  error?: string;
}

/**
 * Format, validate, minify, or prettify JSON
 */
export function formatJson(args: FormatJsonArgs): FormatJsonResult {
  const { input, action, indent = 2 } = args;
  
  if (typeof input !== 'string' || input.trim().length === 0) {
    return {
      valid: false,
      error: 'Input must be a non-empty string',
    };
  }

  if (indent < 0 || indent > 10) {
    return {
      valid: false,
      error: 'Indent must be between 0 and 10',
    };
  }

  try {
    // Parse JSON to validate and get object
    const parsed = JSON.parse(input);

    switch (action) {
      case 'validate':
        return {
          valid: true,
          formatted: JSON.stringify(parsed, null, indent),
        };

      case 'format':
      case 'prettify':
        return {
          valid: true,
          formatted: JSON.stringify(parsed, null, indent),
          minified: JSON.stringify(parsed),
        };

      case 'minify':
        return {
          valid: true,
          formatted: JSON.stringify(parsed, null, indent),
          minified: JSON.stringify(parsed),
        };

      default:
        return {
          valid: false,
          error: `Unknown action: ${action}. Must be one of: format, validate, minify, prettify`,
        };
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        valid: false,
        error: `Invalid JSON: ${error.message}`,
      };
    }
    return {
      valid: false,
      error: `JSON processing error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
