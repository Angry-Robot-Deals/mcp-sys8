/**
 * Data validation utilities
 */

export interface ValidateDataArgs {
  input: string;
  type: 'email' | 'url' | 'ipv4' | 'ipv6' | 'domain' | 'phone' | 
        'credit-card' | 'uuid' | 'hex' | 'base64' | 'json';
}

export interface ValidateDataResult {
  input: string;
  type: string;
  valid: boolean;
  normalized?: string;
  error?: string;
}

// Pre-compiled regex patterns for performance
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/,
  domain: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i,
  phone: /^\+?[1-9]\d{1,14}$/,
  'credit-card': /^\d{13,19}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  hex: /^[0-9a-fA-F]+$/,
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
  json: /^[\s\S]*$/, // JSON validation done via parsing, not regex
};

/**
 * Validate data against various formats
 */
export function validateData(args: ValidateDataArgs): ValidateDataResult {
  const { input, type } = args;
  
  if (typeof input !== 'string' || input.trim().length === 0) {
    return {
      input,
      type,
      valid: false,
      error: 'Input must be a non-empty string',
    };
  }

  const trimmedInput = input.trim();
  const pattern = VALIDATION_PATTERNS[type];

  if (!pattern) {
    return {
      input: trimmedInput,
      type,
      valid: false,
      error: `Unknown validation type: ${type}`,
    };
  }

  let valid = false;
  let normalized: string | undefined;
  let error: string | undefined;

  try {
    switch (type) {
      case 'email':
        valid = VALIDATION_PATTERNS.email.test(trimmedInput);
        if (valid) {
          normalized = trimmedInput.toLowerCase();
        } else {
          error = 'Invalid email format';
        }
        break;

      case 'url':
        valid = VALIDATION_PATTERNS.url.test(trimmedInput);
        if (valid) {
          try {
            const url = new URL(trimmedInput);
            normalized = url.href;
          } catch {
            // If URL constructor fails, still valid if regex matches
            normalized = trimmedInput;
          }
        } else {
          error = 'Invalid URL format. Must start with http:// or https://';
        }
        break;

      case 'ipv4':
        valid = VALIDATION_PATTERNS.ipv4.test(trimmedInput);
        if (valid) {
          normalized = trimmedInput;
        } else {
          error = 'Invalid IPv4 address format';
        }
        break;

      case 'ipv6':
        valid = VALIDATION_PATTERNS.ipv6.test(trimmedInput) || 
                /^(?:[0-9a-fA-F]{1,4}:){0,7}[0-9a-fA-F]{1,4}$/.test(trimmedInput);
        if (valid) {
          normalized = trimmedInput.toLowerCase();
        } else {
          error = 'Invalid IPv6 address format';
        }
        break;

      case 'domain':
        valid = VALIDATION_PATTERNS.domain.test(trimmedInput);
        if (valid) {
          normalized = trimmedInput.toLowerCase();
        } else {
          error = 'Invalid domain format';
        }
        break;

      case 'phone':
        // Remove common formatting characters
        const phoneDigits = trimmedInput.replace(/[\s\-\(\)\.]/g, '');
        valid = VALIDATION_PATTERNS.phone.test(phoneDigits);
        if (valid) {
          normalized = phoneDigits;
        } else {
          error = 'Invalid phone number format. Must be E.164 format (e.g., +1234567890)';
        }
        break;

      case 'credit-card':
        // Remove spaces and hyphens
        const cardDigits = trimmedInput.replace(/[\s\-]/g, '');
        valid = VALIDATION_PATTERNS['credit-card'].test(cardDigits) && 
                cardDigits.length >= 13 && cardDigits.length <= 19;
        if (valid) {
          // Basic Luhn algorithm check
          let sum = 0;
          let isEven = false;
          for (let i = cardDigits.length - 1; i >= 0; i--) {
            let digit = parseInt(cardDigits[i], 10);
            if (isEven) {
              digit *= 2;
              if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
          }
          valid = sum % 10 === 0;
          if (valid) {
            normalized = cardDigits;
          } else {
            error = 'Invalid credit card number (Luhn check failed)';
          }
        } else {
          error = 'Invalid credit card format. Must be 13-19 digits';
        }
        break;

      case 'uuid':
        valid = VALIDATION_PATTERNS.uuid.test(trimmedInput);
        if (valid) {
          normalized = trimmedInput.toLowerCase();
        } else {
          error = 'Invalid UUID format. Must be UUID v4 format';
        }
        break;

      case 'hex':
        valid = VALIDATION_PATTERNS.hex.test(trimmedInput);
        if (valid) {
          normalized = trimmedInput.toLowerCase();
        } else {
          error = 'Invalid hex string format';
        }
        break;

      case 'base64':
        valid = VALIDATION_PATTERNS.base64.test(trimmedInput);
        if (valid) {
          // Try to decode to verify it's valid base64
          try {
            Buffer.from(trimmedInput, 'base64');
            normalized = trimmedInput;
          } catch {
            valid = false;
            error = 'Invalid Base64 string (decoding failed)';
          }
        } else {
          error = 'Invalid Base64 format';
        }
        break;

      case 'json':
        // Validate JSON by attempting to parse it
        try {
          const parsed = JSON.parse(trimmedInput);
          valid = true;
          // Return formatted JSON as normalized value
          normalized = JSON.stringify(parsed, null, 2);
        } catch (parseError) {
          valid = false;
          if (parseError instanceof SyntaxError) {
            error = `Invalid JSON: ${parseError.message}`;
          } else {
            error = `JSON validation failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
          }
        }
        break;

      default:
        return {
          input: trimmedInput,
          type,
          valid: false,
          error: `Unknown validation type: ${type}`,
        };
    }
  } catch (err) {
    return {
      input: trimmedInput,
      type,
      valid: false,
      error: `Validation error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  return {
    input: trimmedInput,
    type,
    valid,
    normalized: valid ? normalized : undefined,
    error: valid ? undefined : error,
  };
}
