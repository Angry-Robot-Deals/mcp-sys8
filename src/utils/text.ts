/**
 * Text formatting utilities: case conversion, slug generation
 */

export interface FormatTextCaseArgs {
  input: string;
  format?: 'camelCase' | 'PascalCase' | 'kebab-case' | 'snake_case' | 
          'CONSTANT_CASE' | 'Title Case' | 'lowercase' | 'UPPERCASE';
}

export interface GenerateSlugArgs {
  input: string;
  separator?: string;
  lowercase?: boolean;
}

export interface FormatTextCaseResult {
  input: string;
  camelCase: string;
  PascalCase: string;
  'kebab-case': string;
  snake_case: string;
  CONSTANT_CASE: string;
  'Title Case': string;
  lowercase: string;
  UPPERCASE: string;
}

export interface GenerateSlugResult {
  input: string;
  slug: string;
  separator: string;
}

/**
 * Convert text to different case formats
 * Returns all formats regardless of requested format for convenience
 */
export function formatTextCase(args: FormatTextCaseArgs): FormatTextCaseResult {
  const { input } = args;
  
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  // Normalize input: split by spaces, hyphens, underscores, or camelCase boundaries
  let words: string[] = [];
  
  // First, split on spaces, hyphens, underscores
  const parts = input.trim().split(/[\s\-_]+/);
  
  // Process each part
  for (const part of parts) {
    if (part.length === 0) continue;
    
    // If part contains uppercase letters (camelCase/PascalCase), split it
    if (/[A-Z]/.test(part) && part.length > 1) {
      // Split on capital letters (positive lookahead)
      const camelParts = part.split(/(?=[A-Z])/).map(w => w.toLowerCase());
      words.push(...camelParts);
    } else {
      words.push(part.toLowerCase());
    }
  }
  
  words = words.filter(w => w.length > 0);

  if (words.length === 0) {
    throw new Error('Input must contain at least one word');
  }

  const result: FormatTextCaseResult = {
    input,
    camelCase: '',
    PascalCase: '',
    'kebab-case': '',
    snake_case: '',
    CONSTANT_CASE: '',
    'Title Case': '',
    lowercase: '',
    UPPERCASE: '',
  };

  // Generate all formats
  result.camelCase = words[0] + words.slice(1).map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join('');
  
  result.PascalCase = words.map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join('');
  
  result['kebab-case'] = words.join('-');
  result.snake_case = words.join('_');
  result.CONSTANT_CASE = words.join('_').toUpperCase();
  result['Title Case'] = words.map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  result.lowercase = words.join(' ');
  result.UPPERCASE = words.join(' ').toUpperCase();

  return result;
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(args: GenerateSlugArgs): GenerateSlugResult {
  const { input, separator = '-', lowercase: shouldLowercase = true } = args;
  
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  if (typeof separator !== 'string' || separator.length === 0) {
    throw new Error('Separator must be a non-empty string');
  }

  // Normalize: convert to lowercase, replace spaces/special chars with separator
  let slug = input
    .trim()
    .toLowerCase()
    // Replace multiple spaces/hyphens/underscores with single separator
    .replace(/[\s\-_]+/g, separator)
    // Remove special characters, keep only alphanumeric and separator
    .replace(/[^a-z0-9\-_]/g, '')
    // Replace multiple separators with single one
    .replace(new RegExp(`\\${separator}+`, 'g'), separator)
    // Remove leading/trailing separators
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');

  // Apply lowercase if requested (already done, but keep for consistency)
  if (!shouldLowercase) {
    // If not lowercase, try to preserve original case
    slug = input
      .trim()
      .replace(/[\s\-_]+/g, separator)
      .replace(/[^a-zA-Z0-9\-_]/g, '')
      .replace(new RegExp(`\\${separator}+`, 'g'), separator)
      .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
  }

  if (slug.length === 0) {
    throw new Error('Generated slug is empty. Input may contain only special characters.');
  }

  return {
    input,
    slug,
    separator,
  };
}
