import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Unified random data generation utilities
 * Combines UUID generation and random string generation
 */

export interface GenerateRandomArgs {
  type: 'uuid' | 'hex' | 'base64' | 'bytes';
  length?: number; // For hex, base64, bytes (8-128 bytes)
  format?: 'standard' | 'uppercase' | 'without-dashes'; // For UUID only
}

export interface GenerateRandomResult {
  type: string;
  value: string;
  uuid?: {
    standard: string;
    uppercase: string;
    without_dashes: string;
  };
  hex?: {
    [key: string]: string; // hex_8, hex_16, hex_32, hex_64
  };
  base64?: {
    [key: string]: string; // base64_8, base64_16, base64_32, base64_64
  };
  bytes?: string; // Raw bytes as base64
}

/**
 * Generate random data (UUID, hex, base64, or raw bytes)
 */
export async function generateRandom(args: GenerateRandomArgs): Promise<GenerateRandomResult> {
  const { type, length, format } = args;

  switch (type) {
    case 'uuid':
      return generateUuid(format);

    case 'hex':
      return generateHexStrings(length);

    case 'base64':
      return generateBase64Strings(length);

    case 'bytes':
      return generateRawBytes(length);

    default:
      throw new Error(`Unknown random type: ${type}. Must be one of: uuid, hex, base64, bytes`);
  }
}

/**
 * Generate UUID v4 in different formats
 */
function generateUuid(format?: 'standard' | 'uppercase' | 'without-dashes'): GenerateRandomResult {
  const uuid = crypto.randomUUID();

  return {
    type: 'uuid',
    value: uuid,
    uuid: {
      standard: uuid,
      uppercase: uuid.toUpperCase(),
      without_dashes: uuid.replace(/-/g, ''),
    },
  };
}

/**
 * Generate hex strings in multiple lengths
 */
async function generateHexStrings(length?: number): Promise<GenerateRandomResult> {
  // If specific length requested, generate only that
  if (length && length >= 8 && length <= 128) {
    const byteLength = length; // length is in bytes, hex needs bytes
    try {
      const { stdout } = await execAsync(`openssl rand --hex ${byteLength} | tr 'a-f' 'A-F'`);
      return {
        type: 'hex',
        value: stdout.trim(),
        hex: {
          [`hex_${length}_uppercase`]: stdout.trim(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate hex string: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate all standard lengths
  const lengths = [8, 16, 32, 64];
  const results: Record<string, string> = {};
  const errors: string[] = [];

  const promises = lengths.map(async (len) => {
    try {
      const { stdout } = await execAsync(`openssl rand --hex ${len} | tr 'a-f' 'A-F'`);
      results[`hex_${len}_uppercase`] = stdout.trim();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`hex_${len}: ${errorMsg}`);
      results[`hex_${len}_uppercase`] = null as any;
    }
  });

  await Promise.all(promises);

  if (errors.length === lengths.length) {
    throw new Error(`Failed to generate hex strings. openssl may not be installed. Errors: ${errors.join('; ')}`);
  }

  return {
    type: 'hex',
    value: results[`hex_${lengths[0]}_uppercase`] || '',
    hex: results,
  };
}

/**
 * Generate base64 strings in multiple lengths
 */
async function generateBase64Strings(length?: number): Promise<GenerateRandomResult> {
  // If specific length requested, generate only that
  if (length && length >= 8 && length <= 128) {
    try {
      const { stdout } = await execAsync(`openssl rand ${length} | openssl base64 -A -nopad`);
      return {
        type: 'base64',
        value: stdout.trim(),
        base64: {
          [`base64_${length}`]: stdout.trim(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate base64 string: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate all standard lengths
  const lengths = [8, 16, 32, 64];
  const results: Record<string, string> = {};
  const errors: string[] = [];

  const promises = lengths.map(async (len) => {
    try {
      const { stdout } = await execAsync(`openssl rand ${len} | openssl base64 -A -nopad`);
      results[`base64_${len}`] = stdout.trim();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`base64_${len}: ${errorMsg}`);
      results[`base64_${len}`] = null as any;
    }
  });

  await Promise.all(promises);

  if (errors.length === lengths.length) {
    throw new Error(`Failed to generate base64 strings. openssl may not be installed. Errors: ${errors.join('; ')}`);
  }

  return {
    type: 'base64',
    value: results[`base64_${lengths[0]}`] || '',
    base64: results,
  };
}

/**
 * Generate raw random bytes
 */
async function generateRawBytes(length: number = 32): Promise<GenerateRandomResult> {
  if (length < 8 || length > 128) {
    throw new Error('Length must be between 8 and 128 bytes');
  }

  try {
    const { stdout } = await execAsync(`openssl rand ${length} | openssl base64 -A -nopad`);
    return {
      type: 'bytes',
      value: stdout.trim(),
      bytes: stdout.trim(),
    };
  } catch (error) {
    throw new Error(`Failed to generate random bytes: ${error instanceof Error ? error.message : String(error)}`);
  }
}
