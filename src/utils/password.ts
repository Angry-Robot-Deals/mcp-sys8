import * as crypto from 'crypto';

/**
 * Password generation utilities
 */

export interface GeneratePasswordArgs {
  length?: number;
  include_uppercase?: boolean;
  include_lowercase?: boolean;
  include_numbers?: boolean;
  include_symbols?: boolean;
  exclude_similar?: boolean;
}

export interface GeneratePasswordResult {
  password: string;
  length: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  entropy: number;
  character_set_size: number;
}

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = 'il1Lo0O'; // Characters that look similar

/**
 * Generate a secure password
 */
export function generatePassword(args: GeneratePasswordArgs = {}): GeneratePasswordResult {
  const {
    length = 16,
    include_uppercase = true,
    include_lowercase = true,
    include_numbers = true,
    include_symbols = true,
    exclude_similar = false,
  } = args;

  // Validate length
  if (length < 8 || length > 128) {
    throw new Error('Password length must be between 8 and 128 characters');
  }

  // Build character set
  let charset = '';
  
  if (include_uppercase) {
    charset += UPPERCASE;
  }
  if (include_lowercase) {
    charset += LOWERCASE;
  }
  if (include_numbers) {
    charset += NUMBERS;
  }
  if (include_symbols) {
    charset += SYMBOLS;
  }

  // Remove similar characters if requested
  if (exclude_similar) {
    charset = charset.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
  }

  // Validate that we have at least one character type
  if (charset.length === 0) {
    throw new Error('At least one character type must be included (uppercase, lowercase, numbers, or symbols)');
  }

  // Ensure at least one character from each selected type is included
  const passwordChars: string[] = [];
  const remainingLength = length;

  // Add at least one character from each selected type
  if (include_uppercase) {
    const available = exclude_similar 
      ? UPPERCASE.split('').filter(c => !SIMILAR_CHARS.includes(c))
      : UPPERCASE;
    if (available.length > 0) {
      passwordChars.push(available[Math.floor(Math.random() * available.length)]);
    }
  }
  if (include_lowercase) {
    const available = exclude_similar 
      ? LOWERCASE.split('').filter(c => !SIMILAR_CHARS.includes(c))
      : LOWERCASE;
    if (available.length > 0) {
      passwordChars.push(available[Math.floor(Math.random() * available.length)]);
    }
  }
  if (include_numbers) {
    const available = exclude_similar 
      ? NUMBERS.split('').filter(c => !SIMILAR_CHARS.includes(c))
      : NUMBERS;
    if (available.length > 0) {
      passwordChars.push(available[Math.floor(Math.random() * available.length)]);
    }
  }
  if (include_symbols) {
    passwordChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }

  // Fill the rest with random characters from the full charset
  const needed = length - passwordChars.length;
  for (let i = 0; i < needed; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    passwordChars.push(charset[randomIndex]);
  }

  // Shuffle the password to avoid predictable patterns
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  const password = passwordChars.join('');

  // Calculate entropy (log2(charset_size) * length)
  const entropy = Math.log2(charset.length) * length;

  // Determine strength based on entropy and length
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (entropy < 40 || length < 12) {
    strength = 'weak';
  } else if (entropy < 60 || length < 16) {
    strength = 'medium';
  } else if (entropy < 80 || length < 20) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  return {
    password,
    length: password.length,
    strength,
    entropy: Math.round(entropy * 10) / 10, // Round to 1 decimal place
    character_set_size: charset.length,
  };
}
