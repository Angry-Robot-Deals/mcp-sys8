/**
 * Base64 and URL encoding/decoding utilities
 */

export interface EncodeBase64Args {
  input: string;
  encoding?: 'utf8' | 'hex' | 'binary';
}

export interface DecodeBase64Args {
  input: string;
  encoding?: 'utf8' | 'hex' | 'binary';
}

export interface EncodeUrlArgs {
  input: string;
  component?: 'full' | 'path' | 'query';
}

export interface DecodeUrlArgs {
  input: string;
  component?: 'full' | 'path' | 'query';
}

export interface EncodeBase64Result {
  encoded: string;
  input: string;
  encoding: string;
}

export interface DecodeBase64Result {
  decoded: string;
  input: string;
  encoding: string;
}

export interface EncodeUrlResult {
  encoded: string;
  input: string;
  component: string;
}

export interface DecodeUrlResult {
  decoded: string;
  input: string;
  component: string;
}

/**
 * Encode string to Base64
 */
export function encodeBase64(args: EncodeBase64Args): EncodeBase64Result {
  const { input, encoding = 'utf8' } = args;
  
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  let buffer: Buffer;
  
  switch (encoding) {
    case 'hex':
      // If input is hex string, convert to buffer
      if (!/^[0-9a-fA-F]+$/.test(input)) {
        throw new Error('Input must be a valid hex string for hex encoding');
      }
      buffer = Buffer.from(input, 'hex');
      break;
    case 'binary':
      buffer = Buffer.from(input, 'binary');
      break;
    case 'utf8':
    default:
      buffer = Buffer.from(input, 'utf8');
      break;
  }

  const encoded = buffer.toString('base64');

  return {
    encoded,
    input,
    encoding,
  };
}

/**
 * Decode Base64 string
 */
export function decodeBase64(args: DecodeBase64Args): DecodeBase64Result {
  const { input, encoding = 'utf8' } = args;
  
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  try {
    const buffer = Buffer.from(input, 'base64');
    let decoded: string;

    switch (encoding) {
      case 'hex':
        decoded = buffer.toString('hex');
        break;
      case 'binary':
        decoded = buffer.toString('binary');
        break;
      case 'utf8':
      default:
        decoded = buffer.toString('utf8');
        break;
    }

    return {
      decoded,
      input,
      encoding,
    };
  } catch (error) {
    throw new Error(`Invalid Base64 string: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Encode string for URL
 */
export function encodeUrl(args: EncodeUrlArgs): EncodeUrlResult {
  const { input, component = 'full' } = args;
  
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  let encoded: string;

  switch (component) {
    case 'query':
      // Encode for query string (encodeURIComponent)
      encoded = encodeURIComponent(input);
      break;
    case 'path':
      // Encode for path (encodeURI but preserve /)
      encoded = encodeURI(input).replace(/%2F/g, '/');
      break;
    case 'full':
    default:
      // Full URL encoding
      encoded = encodeURIComponent(input);
      break;
  }

  return {
    encoded,
    input,
    component,
  };
}

/**
 * Decode URL-encoded string
 */
export function decodeUrl(args: DecodeUrlArgs): DecodeUrlResult {
  const { input, component = 'full' } = args;
  
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  try {
    let decoded: string;

    switch (component) {
      case 'query':
        decoded = decodeURIComponent(input);
        break;
      case 'path':
        decoded = decodeURI(input);
        break;
      case 'full':
      default:
        decoded = decodeURIComponent(input);
        break;
    }

    return {
      decoded,
      input,
      component,
    };
  } catch (error) {
    throw new Error(`Invalid URL-encoded string: ${error instanceof Error ? error.message : String(error)}`);
  }
}
