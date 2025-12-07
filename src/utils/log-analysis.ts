/**
 * Log analysis utilities for detecting errors and warnings
 */

export interface AnalyzeLogsArgs {
  text: string;
}

export interface AnalyzeLogsResult {
  error_count: number;
  warning_count: number;
  errors: Array<{
    line: number;
    message: string;
    type: string;
  }>;
  warnings: Array<{
    line: number;
    message: string;
    type: string;
  }>;
}

// Error patterns - common log errors
const ERROR_PATTERNS = [
  // Compilation errors
  { pattern: /error\s+(TS\d+|E\d+):/gi, type: 'compilation' },
  { pattern: /error:\s+.*failed/gi, type: 'general' },
  { pattern: /build\s+failed/gi, type: 'build' },
  { pattern: /compilation\s+error/gi, type: 'compilation' },
  { pattern: /syntax\s+error/gi, type: 'syntax' },
  { pattern: /type\s+error/gi, type: 'type' },
  
  // npm/package errors
  { pattern: /npm\s+ERR!/gi, type: 'npm' },
  { pattern: /EACCES.*permission\s+denied/gi, type: 'permission' },
  { pattern: /ENOENT.*not\s+found/gi, type: 'file_not_found' },
  { pattern: /ECONNREFUSED/gi, type: 'connection' },
  { pattern: /ETIMEDOUT/gi, type: 'timeout' },
  { pattern: /npm\s+error\s+code\s+\d+/gi, type: 'npm' },
  { pattern: /failed\s+to\s+install/gi, type: 'installation' },
  { pattern: /package.*not\s+found/gi, type: 'package_not_found' },
  { pattern: /peer\s+dependency\s+missing/gi, type: 'dependency' },
  
  // Docker errors
  { pattern: /docker.*error/gi, type: 'docker' },
  { pattern: /failed\s+to\s+build/gi, type: 'docker_build' },
  { pattern: /image\s+not\s+found/gi, type: 'docker_image' },
  { pattern: /container\s+.*failed/gi, type: 'docker_container' },
  { pattern: /docker:\s+error/gi, type: 'docker' },
  { pattern: /ERROR.*docker/gi, type: 'docker' },
  
  // Runtime errors
  { pattern: /Error:\s+/gi, type: 'runtime' },
  { pattern: /Exception:\s+/gi, type: 'exception' },
  { pattern: /FATAL\s+ERROR/gi, type: 'fatal' },
  { pattern: /uncaught\s+exception/gi, type: 'exception' },
  { pattern: /unhandled\s+rejection/gi, type: 'rejection' },
  { pattern: /stack\s+overflow/gi, type: 'stack_overflow' },
  { pattern: /out\s+of\s+memory/gi, type: 'memory' },
  { pattern: /maximum\s+call\s+stack/gi, type: 'stack' },
  
  // Network/HTTP errors
  { pattern: /HTTP\s+error\s+\d+/gi, type: 'http' },
  { pattern: /\d{3}\s+error/gi, type: 'http_status' },
  { pattern: /connection\s+refused/gi, type: 'connection' },
  { pattern: /connection\s+timeout/gi, type: 'timeout' },
  { pattern: /network\s+error/gi, type: 'network' },
  { pattern: /ECONNRESET/gi, type: 'connection_reset' },
  
  // File system errors
  { pattern: /ENOENT/gi, type: 'file_not_found' },
  { pattern: /EACCES/gi, type: 'permission_denied' },
  { pattern: /EISDIR/gi, type: 'is_directory' },
  { pattern: /ENOTDIR/gi, type: 'not_directory' },
  { pattern: /EEXIST/gi, type: 'file_exists' },
  { pattern: /EMFILE/gi, type: 'too_many_files' },
  { pattern: /cannot\s+read\s+property/gi, type: 'property_access' },
  { pattern: /cannot\s+find\s+module/gi, type: 'module_not_found' },
  
  // Database errors
  { pattern: /database\s+error/gi, type: 'database' },
  { pattern: /SQL\s+error/gi, type: 'sql' },
  { pattern: /connection\s+to\s+database\s+failed/gi, type: 'database_connection' },
  { pattern: /query\s+failed/gi, type: 'query' },
  
  // Authentication/Authorization errors
  { pattern: /authentication\s+failed/gi, type: 'authentication' },
  { pattern: /unauthorized/gi, type: 'authorization' },
  { pattern: /access\s+denied/gi, type: 'access_denied' },
  { pattern: /invalid\s+token/gi, type: 'token' },
  { pattern: /token\s+expired/gi, type: 'token_expired' },
  
  // Generic error patterns
  { pattern: /\[ERROR\]/gi, type: 'generic' },
  { pattern: /\[error\]/gi, type: 'generic' },
  { pattern: /ERROR:/gi, type: 'generic' },
  { pattern: /Error:/gi, type: 'generic' },
  { pattern: /failed/gi, type: 'generic' },
  { pattern: /failure/gi, type: 'generic' },
];

// Warning patterns - common log warnings
const WARNING_PATTERNS = [
  // npm warnings
  { pattern: /npm\s+WARN/gi, type: 'npm' },
  { pattern: /deprecated/gi, type: 'deprecated' },
  { pattern: /peer\s+dependency/gi, type: 'peer_dependency' },
  { pattern: /optional\s+dependency/gi, type: 'optional_dependency' },
  
  // Compilation warnings
  { pattern: /warning\s+(TS\d+|W\d+):/gi, type: 'compilation' },
  { pattern: /warning:\s+/gi, type: 'general' },
  { pattern: /unused\s+variable/gi, type: 'unused' },
  { pattern: /unused\s+import/gi, type: 'unused' },
  { pattern: /any\s+type/gi, type: 'type_safety' },
  
  // Docker warnings
  { pattern: /docker.*warning/gi, type: 'docker' },
  { pattern: /WARNING.*docker/gi, type: 'docker' },
  
  // Runtime warnings
  { pattern: /\[WARN\]/gi, type: 'generic' },
  { pattern: /\[warn\]/gi, type: 'generic' },
  { pattern: /WARNING:/gi, type: 'generic' },
  { pattern: /Warning:/gi, type: 'generic' },
  { pattern: /deprecated\s+API/gi, type: 'deprecated_api' },
  { pattern: /experimental\s+feature/gi, type: 'experimental' },
  
  // Security warnings
  { pattern: /security\s+warning/gi, type: 'security' },
  { pattern: /vulnerability/gi, type: 'vulnerability' },
  { pattern: /insecure/gi, type: 'security' },
  
  // Performance warnings
  { pattern: /performance\s+warning/gi, type: 'performance' },
  { pattern: /slow\s+query/gi, type: 'performance' },
  { pattern: /memory\s+leak/gi, type: 'memory' },
  
  // Generic warning patterns
  { pattern: /caution/gi, type: 'generic' },
  { pattern: /notice/gi, type: 'generic' },
];

/**
 * Analyze text for errors and warnings in logs
 */
export function analyzeLogs(args: AnalyzeLogsArgs): AnalyzeLogsResult {
  const { text } = args;
  
  if (typeof text !== 'string' || text.trim().length === 0) {
    return {
      error_count: 0,
      warning_count: 0,
      errors: [],
      warnings: [],
    };
  }

  const lines = text.split('\n');
  const errors: Array<{ line: number; message: string; type: string }> = [];
  const warnings: Array<{ line: number; message: string; type: string }> = [];
  const errorLines = new Set<number>();
  const warningLines = new Set<number>();

  // Check each line for errors
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    if (trimmedLine.length === 0) {
      return;
    }

    // Check for errors
    for (const { pattern, type } of ERROR_PATTERNS) {
      if (pattern.test(trimmedLine)) {
        if (!errorLines.has(lineNumber)) {
          errors.push({
            line: lineNumber,
            message: trimmedLine.substring(0, 200), // Limit message length
            type,
          });
          errorLines.add(lineNumber);
        }
        break; // Only count each line once
      }
    }

    // Check for warnings (only if not already marked as error)
    if (!errorLines.has(lineNumber)) {
      for (const { pattern, type } of WARNING_PATTERNS) {
        if (pattern.test(trimmedLine)) {
          if (!warningLines.has(lineNumber)) {
            warnings.push({
              line: lineNumber,
              message: trimmedLine.substring(0, 200), // Limit message length
              type,
            });
            warningLines.add(lineNumber);
          }
          break; // Only count each line once
        }
      }
    }
  });

  return {
    error_count: errors.length,
    warning_count: warnings.length,
    errors,
    warnings,
  };
}
