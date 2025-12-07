/**
 * Language and character analysis utilities
 */

export interface AnalyzeLanguageArgs {
  text: string;
}

export interface AnalyzeLanguageResult {
  total_characters: number;
  encoding?: string;
  languages: {
    english: { count: number; percentage: number };
    chinese: { count: number; percentage: number };
    russian: { count: number; percentage: number };
    ukrainian: { count: number; percentage: number };
    vietnamese: { count: number; percentage: number };
    japanese: { count: number; percentage: number };
    turkish: { count: number; percentage: number };
    spanish: { count: number; percentage: number };
  };
  categories: {
    digits: { count: number; percentage: number };
    punctuation: { count: number; percentage: number };
    symbols: { count: number; percentage: number };
    whitespace: { count: number; percentage: number };
    other: { count: number; percentage: number };
  };
}

// Unicode ranges for different languages
const UNICODE_RANGES = {
  // English (Basic Latin)
  english: [
    { start: 0x0041, end: 0x005A }, // A-Z
    { start: 0x0061, end: 0x007A }, // a-z
  ],
  
  // Chinese (CJK Unified Ideographs)
  chinese: [
    { start: 0x4E00, end: 0x9FFF }, // CJK Unified Ideographs
    { start: 0x3400, end: 0x4DBF }, // Extension A
    { start: 0xF900, end: 0xFAFF }, // Compatibility Ideographs
    { start: 0x2E80, end: 0x2EFF }, // CJK Radicals Supplement
    { start: 0x2F00, end: 0x2FDF }, // Kangxi Radicals
    { start: 0x3000, end: 0x303F }, // CJK Symbols and Punctuation
    { start: 0x3100, end: 0x312F }, // Bopomofo
    { start: 0x31A0, end: 0x31BF }, // Bopomofo Extended
  ],
  
  // Japanese
  japanese: [
    { start: 0x3040, end: 0x309F }, // Hiragana
    { start: 0x30A0, end: 0x30FF }, // Katakana
    { start: 0x31F0, end: 0x31FF }, // Katakana Phonetic Extensions
    { start: 0xFF00, end: 0xFFEF }, // Halfwidth and Fullwidth Forms
    // Also includes CJK ranges (shared with Chinese)
    { start: 0x4E00, end: 0x9FFF }, // CJK Unified Ideographs
  ],
  
  // Russian and Ukrainian (Cyrillic)
  russian: [
    { start: 0x0400, end: 0x04FF }, // Cyrillic
    { start: 0x0500, end: 0x052F }, // Cyrillic Supplement
    { start: 0x2DE0, end: 0x2DFF }, // Cyrillic Extended-A
    { start: 0xA640, end: 0xA69F }, // Cyrillic Extended-B
    { start: 0x1C80, end: 0x1C8F }, // Cyrillic Extended-C
  ],
  
  ukrainian: [
    { start: 0x0400, end: 0x04FF }, // Cyrillic (shared with Russian)
    { start: 0x0500, end: 0x052F }, // Cyrillic Supplement
    { start: 0x2DE0, end: 0x2DFF }, // Cyrillic Extended-A
    { start: 0xA640, end: 0xA69F }, // Cyrillic Extended-B
    { start: 0x1C80, end: 0x1C8F }, // Cyrillic Extended-C
  ],
  
  // Vietnamese (Latin with diacritics)
  vietnamese: [
    { start: 0x0041, end: 0x005A }, // A-Z
    { start: 0x0061, end: 0x007A }, // a-z
    { start: 0x0080, end: 0x00FF }, // Latin-1 Supplement
    { start: 0x0100, end: 0x017F }, // Latin Extended-A
    { start: 0x0180, end: 0x024F }, // Latin Extended-B
    { start: 0x1E00, end: 0x1EFF }, // Latin Extended Additional
    { start: 0x0300, end: 0x036F }, // Combining Diacritical Marks
  ],
  
  // Turkish (Latin with specific characters)
  turkish: [
    { start: 0x0041, end: 0x005A }, // A-Z
    { start: 0x0061, end: 0x007A }, // a-z
    { start: 0x0080, end: 0x00FF }, // Latin-1 Supplement (includes İ, ı, Ş, ş, Ğ, ğ, Ç, ç, Ö, ö, Ü, ü)
    { start: 0x0100, end: 0x017F }, // Latin Extended-A
  ],
  
  // Spanish (Latin)
  spanish: [
    { start: 0x0041, end: 0x005A }, // A-Z
    { start: 0x0061, end: 0x007A }, // a-z
    { start: 0x0080, end: 0x00FF }, // Latin-1 Supplement (includes á, é, í, ó, ú, ñ, ü)
  ],
};

// Helper function to check if a character code is in a range
function isInRange(code: number, ranges: Array<{ start: number; end: number }>): boolean {
  return ranges.some(range => code >= range.start && code <= range.end);
}

// Helper function to detect encoding (simple heuristic)
function detectEncoding(text: string): string | undefined {
  try {
    // Try to detect UTF-8 BOM
    if (text.charCodeAt(0) === 0xFEFF) {
      return 'UTF-8 (BOM)';
    }
    
    // Check for UTF-16 BOM
    if (text.length >= 2) {
      const first = text.charCodeAt(0);
      const second = text.charCodeAt(1);
      if (first === 0xFE && second === 0xFF) {
        return 'UTF-16 BE';
      }
      if (first === 0xFF && second === 0xFE) {
        return 'UTF-16 LE';
      }
    }
    
    // Check if all characters are valid UTF-8
    // In JavaScript, strings are always UTF-16 internally, but we can check for valid Unicode
    let hasHighSurrogate = false;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      
      // Check for surrogate pairs (UTF-16)
      if (code >= 0xD800 && code <= 0xDBFF) {
        hasHighSurrogate = true;
        if (i + 1 < text.length) {
          const next = text.charCodeAt(i + 1);
          if (next >= 0xDC00 && next <= 0xDFFF) {
            i++; // Skip low surrogate
            continue;
          }
        }
      }
      
      // Check for invalid characters
      if (code === 0xFFFD) {
        return 'UTF-8 (with replacement characters)';
      }
    }
    
    // If we have surrogate pairs, it's likely UTF-16
    if (hasHighSurrogate) {
      return 'UTF-16';
    }
    
    // Default assumption for JavaScript strings
    return 'UTF-16 (JavaScript default)';
  } catch (e) {
    return undefined;
  }
}

// Helper function to calculate percentage with 2 decimal places
function calculatePercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 10000) / 100; // Round to 2 decimal places
}

/**
 * Analyze text for language and character distribution
 */
export function analyzeLanguage(args: AnalyzeLanguageArgs): AnalyzeLanguageResult {
  const { text } = args;
  
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const totalChars = text.length;
  if (totalChars === 0) {
    return {
      total_characters: 0,
      languages: {
        english: { count: 0, percentage: 0 },
        chinese: { count: 0, percentage: 0 },
        russian: { count: 0, percentage: 0 },
        ukrainian: { count: 0, percentage: 0 },
        vietnamese: { count: 0, percentage: 0 },
        japanese: { count: 0, percentage: 0 },
        turkish: { count: 0, percentage: 0 },
        spanish: { count: 0, percentage: 0 },
      },
      categories: {
        digits: { count: 0, percentage: 0 },
        punctuation: { count: 0, percentage: 0 },
        symbols: { count: 0, percentage: 0 },
        whitespace: { count: 0, percentage: 0 },
        other: { count: 0, percentage: 0 },
      },
    };
  }

  // Initialize counters
  const languageCounts: Record<string, number> = {
    english: 0,
    chinese: 0,
    russian: 0,
    ukrainian: 0,
    vietnamese: 0,
    japanese: 0,
    turkish: 0,
    spanish: 0,
  };

  const categoryCounts: Record<string, number> = {
    digits: 0,
    punctuation: 0,
    symbols: 0,
    whitespace: 0,
    other: 0,
  };

  // Track which characters have been classified
  const classified = new Set<number>();

  // Analyze each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // Handle surrogate pairs (for characters > U+FFFF)
    let fullCode = code;
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xDC00 && next <= 0xDFFF) {
        fullCode = 0x10000 + ((code - 0xD800) << 10) + (next - 0xDC00);
        i++; // Skip low surrogate
      }
    }

    // Skip if already classified
    if (classified.has(i)) {
      continue;
    }

    // Check language ranges (priority order matters for overlapping ranges)
    let languageFound = false;

    // Chinese (check first as it has specific ranges)
    if (isInRange(fullCode, UNICODE_RANGES.chinese)) {
      languageCounts.chinese++;
      languageFound = true;
      classified.add(i);
    }
    // Japanese (includes CJK, so check after Chinese but before others)
    else if (isInRange(fullCode, UNICODE_RANGES.japanese)) {
      languageCounts.japanese++;
      languageFound = true;
      classified.add(i);
    }
    // Russian and Ukrainian (Cyrillic - same ranges, count separately)
    else if (isInRange(fullCode, UNICODE_RANGES.russian)) {
      // Try to distinguish Russian vs Ukrainian by specific characters
      // Ukrainian has specific characters like і, ї, є
      if (fullCode === 0x0456 || fullCode === 0x0457 || fullCode === 0x0454 || // і, ї, є
          fullCode === 0x0406 || fullCode === 0x0407 || fullCode === 0x0404) { // І, Ї, Є
        languageCounts.ukrainian++;
      } else {
        languageCounts.russian++;
      }
      languageFound = true;
      classified.add(i);
    }
    // Vietnamese (Latin with diacritics) - check for Vietnamese-specific diacritics first
    else if (fullCode >= 0x1E00 && fullCode <= 0x1EFF) {
      languageCounts.vietnamese++;
      languageFound = true;
      classified.add(i);
    }
    // Turkish (Latin with specific characters) - check for Turkish-specific characters first
    else if (fullCode === 0x0130 || fullCode === 0x0131 || // İ, ı
             fullCode === 0x015E || fullCode === 0x015F || // Ş, ş
             fullCode === 0x011E || fullCode === 0x011F || // Ğ, ğ
             fullCode === 0x00C7 || fullCode === 0x00E7 || // Ç, ç
             fullCode === 0x00D6 || fullCode === 0x00F6 || // Ö, ö
             fullCode === 0x00DC || fullCode === 0x00FC) { // Ü, ü
      languageCounts.turkish++;
      languageFound = true;
      classified.add(i);
    }
    // Spanish (Latin with specific characters) - check for Spanish-specific characters first
    else if (fullCode === 0x00E1 || fullCode === 0x00E9 || fullCode === 0x00ED || // á, é, í
             fullCode === 0x00F3 || fullCode === 0x00FA || // ó, ú
             fullCode === 0x00F1 || fullCode === 0x00FC || // ñ, ü
             fullCode === 0x00C1 || fullCode === 0x00C9 || fullCode === 0x00CD || // Á, É, Í
             fullCode === 0x00D3 || fullCode === 0x00DA || // Ó, Ú
             fullCode === 0x00D1) { // Ñ
      languageCounts.spanish++;
      languageFound = true;
      classified.add(i);
    }
    // English (Basic Latin letters) - check basic A-Z, a-z
    else if ((fullCode >= 0x0041 && fullCode <= 0x005A) || // A-Z
             (fullCode >= 0x0061 && fullCode <= 0x007A)) { // a-z
      languageCounts.english++;
      languageFound = true;
      classified.add(i);
    }

    // If not classified as a language character, check categories
    if (!languageFound) {
      // Digits
      if (fullCode >= 0x0030 && fullCode <= 0x0039) {
        categoryCounts.digits++;
        classified.add(i);
      }
      // Whitespace
      else if (/\s/.test(char)) {
        categoryCounts.whitespace++;
        classified.add(i);
      }
      // Punctuation (common punctuation marks)
      else if (/[.,!?;:()\[\]{}\-"'`]/.test(char) ||
               (fullCode >= 0x2000 && fullCode <= 0x206F) || // General Punctuation
               (fullCode >= 0x2E00 && fullCode <= 0x2E7F)) { // Supplemental Punctuation
        categoryCounts.punctuation++;
        classified.add(i);
      }
      // Symbols (mathematical, currency, etc.)
      else if ((fullCode >= 0x20A0 && fullCode <= 0x20CF) || // Currency Symbols
               (fullCode >= 0x2100 && fullCode <= 0x214F) || // Letterlike Symbols
               (fullCode >= 0x2190 && fullCode <= 0x21FF) || // Arrows
               (fullCode >= 0x2200 && fullCode <= 0x22FF) || // Mathematical Operators
               (fullCode >= 0x2300 && fullCode <= 0x23FF) || // Miscellaneous Technical
               (fullCode >= 0x2600 && fullCode <= 0x26FF) || // Miscellaneous Symbols
               (fullCode >= 0x2700 && fullCode <= 0x27BF)) { // Dingbats
        categoryCounts.symbols++;
        classified.add(i);
      }
      // Other (unclassified)
      else {
        categoryCounts.other++;
        classified.add(i);
      }
    }
  }

  // Calculate percentages
  const result: AnalyzeLanguageResult = {
    total_characters: totalChars,
    encoding: detectEncoding(text),
    languages: {
      english: {
        count: languageCounts.english,
        percentage: calculatePercentage(languageCounts.english, totalChars),
      },
      chinese: {
        count: languageCounts.chinese,
        percentage: calculatePercentage(languageCounts.chinese, totalChars),
      },
      russian: {
        count: languageCounts.russian,
        percentage: calculatePercentage(languageCounts.russian, totalChars),
      },
      ukrainian: {
        count: languageCounts.ukrainian,
        percentage: calculatePercentage(languageCounts.ukrainian, totalChars),
      },
      vietnamese: {
        count: languageCounts.vietnamese,
        percentage: calculatePercentage(languageCounts.vietnamese, totalChars),
      },
      japanese: {
        count: languageCounts.japanese,
        percentage: calculatePercentage(languageCounts.japanese, totalChars),
      },
      turkish: {
        count: languageCounts.turkish,
        percentage: calculatePercentage(languageCounts.turkish, totalChars),
      },
      spanish: {
        count: languageCounts.spanish,
        percentage: calculatePercentage(languageCounts.spanish, totalChars),
      },
    },
    categories: {
      digits: {
        count: categoryCounts.digits,
        percentage: calculatePercentage(categoryCounts.digits, totalChars),
      },
      punctuation: {
        count: categoryCounts.punctuation,
        percentage: calculatePercentage(categoryCounts.punctuation, totalChars),
      },
      symbols: {
        count: categoryCounts.symbols,
        percentage: calculatePercentage(categoryCounts.symbols, totalChars),
      },
      whitespace: {
        count: categoryCounts.whitespace,
        percentage: calculatePercentage(categoryCounts.whitespace, totalChars),
      },
      other: {
        count: categoryCounts.other,
        percentage: calculatePercentage(categoryCounts.other, totalChars),
      },
    },
  };

  return result;
}
