#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import * as os from 'os';
import { Parser } from 'expr-eval';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as crypto from 'crypto';

// Import utilities for new functions
import * as randomUtils from './utils/random.js';
import * as encodingUtils from './utils/encoding.js';
import * as textUtils from './utils/text.js';
import * as validationUtils from './utils/validation.js';
import * as jsonUtils from './utils/json.js';
import * as passwordUtils from './utils/password.js';
import * as bytesUtils from './utils/bytes.js';
import * as numberUtils from './utils/number.js';
import * as colorUtils from './utils/color.js';
import * as timezoneUtils from './utils/timezone.js';

const execAsync = promisify(exec);

interface GetDateTimeArgs {
  format?: string;
  timezone?: string;
}

interface CalculateMathExpressionArgs {
  expression: string;
}

interface HashStringArgs {
  input: string;
}

// Unified random generation (replaces random_string and generate_uuid)
interface GenerateRandomArgs {
  type: 'uuid' | 'hex' | 'base64' | 'bytes';
  length?: number; // For hex, base64, bytes (8-128 bytes)
  format?: 'standard' | 'uppercase' | 'without-dashes'; // For UUID only
}

interface EncodeBase64Args {
  input: string;
  encoding?: 'utf8' | 'hex' | 'binary';
}

interface DecodeBase64Args {
  input: string;
  encoding?: 'utf8' | 'hex' | 'binary';
}

interface EncodeUrlArgs {
  input: string;
  component?: 'full' | 'path' | 'query';
}

interface DecodeUrlArgs {
  input: string;
  component?: 'full' | 'path' | 'query';
}

interface FormatTextCaseArgs {
  input: string;
  format?: 'camelCase' | 'PascalCase' | 'kebab-case' | 'snake_case' | 
          'CONSTANT_CASE' | 'Title Case' | 'lowercase' | 'UPPERCASE';
}

interface GenerateSlugArgs {
  input: string;
  separator?: string;
  lowercase?: boolean;
}

interface ValidateDataArgs {
  input: string;
  type: 'email' | 'url' | 'ipv4' | 'ipv6' | 'domain' | 'phone' | 
        'credit-card' | 'uuid' | 'hex' | 'base64';
}

interface FormatJsonArgs {
  input: string;
  action: 'format' | 'validate' | 'minify' | 'prettify';
  indent?: number;
}

// Phase 2: High priority functions
interface GeneratePasswordArgs {
  length?: number;
  include_uppercase?: boolean;
  include_lowercase?: boolean;
  include_numbers?: boolean;
  include_symbols?: boolean;
  exclude_similar?: boolean;
}

interface FormatBytesArgs {
  bytes: number;
  format?: 'binary' | 'decimal';
  precision?: number;
}

// Phase 3: Medium priority functions
interface FormatNumberArgs {
  number: number;
  format: 'currency' | 'percentage' | 'thousands' | 'decimal';
  locale?: string;
  currency?: string;
  minimum_fraction_digits?: number;
  maximum_fraction_digits?: number;
}

interface ConvertColorArgs {
  input: string;
  from: 'hex' | 'rgb' | 'hsl';
  to: 'hex' | 'rgb' | 'hsl';
}

interface ConvertTimezoneArgs {
  datetime: string;
  from_timezone?: string;
  to_timezone: string;
  format?: string;
}

const isValidGetDateTimeArgs = (args: any): args is GetDateTimeArgs =>
  typeof args === 'object' &&
  args !== null &&
  (args.format === undefined || typeof args.format === 'string') &&
  (args.timezone === undefined || typeof args.timezone === 'string');

const isValidCalculateMathExpressionArgs = (args: any): args is CalculateMathExpressionArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.expression === 'string' &&
  args.expression.trim().length > 0;

const isValidHashStringArgs = (args: any): args is HashStringArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0;

// Validation functions for unified random generation
const isValidGenerateRandomArgs = (args: any): args is GenerateRandomArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.type === 'string' &&
  ['uuid', 'hex', 'base64', 'bytes'].includes(args.type) &&
  (args.length === undefined || (typeof args.length === 'number' && args.length >= 8 && args.length <= 128)) &&
  (args.format === undefined || 
   args.format === 'standard' || 
   args.format === 'uppercase' || 
   args.format === 'without-dashes');

const isValidEncodeBase64Args = (args: any): args is EncodeBase64Args =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  (args.encoding === undefined || 
   args.encoding === 'utf8' || 
   args.encoding === 'hex' || 
   args.encoding === 'binary');

const isValidDecodeBase64Args = (args: any): args is DecodeBase64Args =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  (args.encoding === undefined || 
   args.encoding === 'utf8' || 
   args.encoding === 'hex' || 
   args.encoding === 'binary');

const isValidEncodeUrlArgs = (args: any): args is EncodeUrlArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  (args.component === undefined || 
   args.component === 'full' || 
   args.component === 'path' || 
   args.component === 'query');

const isValidDecodeUrlArgs = (args: any): args is DecodeUrlArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  (args.component === undefined || 
   args.component === 'full' || 
   args.component === 'path' || 
   args.component === 'query');

const isValidFormatTextCaseArgs = (args: any): args is FormatTextCaseArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  (args.format === undefined ||
   args.format === 'camelCase' ||
   args.format === 'PascalCase' ||
   args.format === 'kebab-case' ||
   args.format === 'snake_case' ||
   args.format === 'CONSTANT_CASE' ||
   args.format === 'Title Case' ||
   args.format === 'lowercase' ||
   args.format === 'UPPERCASE');

const isValidGenerateSlugArgs = (args: any): args is GenerateSlugArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  (args.separator === undefined || typeof args.separator === 'string') &&
  (args.lowercase === undefined || typeof args.lowercase === 'boolean');

const isValidValidateDataArgs = (args: any): args is ValidateDataArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  typeof args.type === 'string' &&
  ['email', 'url', 'ipv4', 'ipv6', 'domain', 'phone', 'credit-card', 'uuid', 'hex', 'base64', 'json'].includes(args.type);

const isValidFormatJsonArgs = (args: any): args is FormatJsonArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  typeof args.action === 'string' &&
  ['format', 'validate', 'minify', 'prettify'].includes(args.action) &&
  (args.indent === undefined || (typeof args.indent === 'number' && args.indent >= 0 && args.indent <= 10));

// Phase 2: Validation functions
const isValidGeneratePasswordArgs = (args: any): args is GeneratePasswordArgs =>
  typeof args === 'object' &&
  args !== null &&
  (args.length === undefined || (typeof args.length === 'number' && args.length >= 8 && args.length <= 128)) &&
  (args.include_uppercase === undefined || typeof args.include_uppercase === 'boolean') &&
  (args.include_lowercase === undefined || typeof args.include_lowercase === 'boolean') &&
  (args.include_numbers === undefined || typeof args.include_numbers === 'boolean') &&
  (args.include_symbols === undefined || typeof args.include_symbols === 'boolean') &&
  (args.exclude_similar === undefined || typeof args.exclude_similar === 'boolean');

const isValidFormatBytesArgs = (args: any): args is FormatBytesArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.bytes === 'number' &&
  args.bytes >= 0 &&
  Number.isFinite(args.bytes) &&
  (args.format === undefined || args.format === 'binary' || args.format === 'decimal') &&
  (args.precision === undefined || (typeof args.precision === 'number' && args.precision >= 0 && args.precision <= 10));

// Phase 3: Validation functions
const isValidFormatNumberArgs = (args: any): args is FormatNumberArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.number === 'number' &&
  Number.isFinite(args.number) &&
  typeof args.format === 'string' &&
  ['currency', 'percentage', 'thousands', 'decimal'].includes(args.format) &&
  (args.locale === undefined || typeof args.locale === 'string') &&
  (args.currency === undefined || typeof args.currency === 'string') &&
  (args.minimum_fraction_digits === undefined || (typeof args.minimum_fraction_digits === 'number' && args.minimum_fraction_digits >= 0 && args.minimum_fraction_digits <= 20)) &&
  (args.maximum_fraction_digits === undefined || (typeof args.maximum_fraction_digits === 'number' && args.maximum_fraction_digits >= 0 && args.maximum_fraction_digits <= 20));

const isValidConvertColorArgs = (args: any): args is ConvertColorArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.input === 'string' &&
  args.input.trim().length > 0 &&
  typeof args.from === 'string' &&
  ['hex', 'rgb', 'hsl'].includes(args.from) &&
  typeof args.to === 'string' &&
  ['hex', 'rgb', 'hsl'].includes(args.to);

const isValidConvertTimezoneArgs = (args: any): args is ConvertTimezoneArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.datetime === 'string' &&
  args.datetime.trim().length > 0 &&
  typeof args.to_timezone === 'string' &&
  args.to_timezone.trim().length > 0 &&
  (args.from_timezone === undefined || typeof args.from_timezone === 'string') &&
  (args.format === undefined || typeof args.format === 'string');

class SystemInfoServer {
  private server: Server;
  private parser: Parser;

  constructor() {
    this.server = new Server(
      {
        name: 'sys8',
        version: '0.4.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize parser with safe operator configuration
    this.parser = new Parser({
      operators: {
        add: true,
        subtract: true,
        multiply: true,
        divide: true,
        power: true,
        remainder: true,
        factorial: true,
        // Disable unsafe operations
        logical: false,
        comparison: false,
        assignment: false,
        'in': false,
      },
    });

    this.setupToolHandlers();
    
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_current_datetime',
          description: 'Get the current date and time in all available formats (UTC, date string, time string, datetime string, Unix timestamps, human-readable formats)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_os_version',
          description: 'Get the operating system version, platform information, and current user information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'calculate_math_expression',
          description: 'Calculate a mathematical expression safely',
          inputSchema: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: 'Mathematical expression to evaluate (e.g., "2 + 2", "(10 + 5) * 3 / 2", "sqrt(16)")',
              },
            },
            required: ['expression'],
          },
        },
        {
          name: 'hash_string',
          description: 'Generate hash for a string (useful for .env file keys)',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'String to hash',
              },
            },
            required: ['input'],
          },
        },
        // Unified random generation (replaces random_string and generate_uuid)
        {
          name: 'generate_random',
          description: 'Generate random data: UUID v4, hex strings, base64 strings, or raw bytes',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['uuid', 'hex', 'base64', 'bytes'],
                description: 'Type of random data to generate',
              },
              length: {
                type: 'number',
                description: 'Length in bytes for hex/base64/bytes (8-128, default: generates all standard lengths)',
                minimum: 8,
                maximum: 128,
              },
              format: {
                type: 'string',
                enum: ['standard', 'uppercase', 'without-dashes'],
                description: 'Format for UUID only (optional, returns all formats by default)',
              },
            },
            required: ['type'],
          },
        },
        {
          name: 'encode_base64',
          description: 'Encode string to Base64',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'String to encode',
              },
              encoding: {
                type: 'string',
                enum: ['utf8', 'hex', 'binary'],
                description: 'Input encoding (default: utf8)',
              },
            },
            required: ['input'],
          },
        },
        {
          name: 'decode_base64',
          description: 'Decode Base64 string',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Base64 string to decode',
              },
              encoding: {
                type: 'string',
                enum: ['utf8', 'hex', 'binary'],
                description: 'Output encoding (default: utf8)',
              },
            },
            required: ['input'],
          },
        },
        {
          name: 'encode_url',
          description: 'Encode string for URL (URL encoding)',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'String to encode',
              },
              component: {
                type: 'string',
                enum: ['full', 'path', 'query'],
                description: 'Component type (default: full)',
              },
            },
            required: ['input'],
          },
        },
        {
          name: 'decode_url',
          description: 'Decode URL-encoded string',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'URL-encoded string to decode',
              },
              component: {
                type: 'string',
                enum: ['full', 'path', 'query'],
                description: 'Component type (default: full)',
              },
            },
            required: ['input'],
          },
        },
        {
          name: 'format_text_case',
          description: 'Convert text to different case formats (camelCase, PascalCase, kebab-case, snake_case, CONSTANT_CASE, Title Case, lowercase, UPPERCASE)',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Text to convert',
              },
              format: {
                type: 'string',
                enum: ['camelCase', 'PascalCase', 'kebab-case', 'snake_case', 'CONSTANT_CASE', 'Title Case', 'lowercase', 'UPPERCASE'],
                description: 'Target format (optional, returns all formats by default)',
              },
            },
            required: ['input'],
          },
        },
        {
          name: 'generate_slug',
          description: 'Generate URL-friendly slug from text',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Text to convert to slug',
              },
              separator: {
                type: 'string',
                description: 'Separator character (default: -)',
              },
              lowercase: {
                type: 'boolean',
                description: 'Convert to lowercase (default: true)',
              },
            },
            required: ['input'],
          },
        },
        {
          name: 'validate_data',
          description: 'Validate data against various formats (email, url, ipv4, ipv6, domain, phone, credit-card, uuid, hex, base64, json)',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Data to validate',
              },
              type: {
                type: 'string',
                enum: ['email', 'url', 'ipv4', 'ipv6', 'domain', 'phone', 'credit-card', 'uuid', 'hex', 'base64', 'json'],
                description: 'Validation type',
              },
            },
            required: ['input', 'type'],
          },
        },
        {
          name: 'format_json',
          description: 'Format, validate, minify, or prettify JSON',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'JSON string to process',
              },
              action: {
                type: 'string',
                enum: ['format', 'validate', 'minify', 'prettify'],
                description: 'Action to perform',
              },
              indent: {
                type: 'number',
                description: 'Number of spaces for indentation (0-10, default: 2)',
                minimum: 0,
                maximum: 10,
              },
            },
            required: ['input', 'action'],
          },
        },
        // Phase 2: High priority functions
        {
          name: 'generate_password',
          description: 'Generate secure passwords with customizable options',
          inputSchema: {
            type: 'object',
            properties: {
              length: {
                type: 'number',
                description: 'Password length (8-128, default: 16)',
                minimum: 8,
                maximum: 128,
              },
              include_uppercase: {
                type: 'boolean',
                description: 'Include uppercase letters (default: true)',
              },
              include_lowercase: {
                type: 'boolean',
                description: 'Include lowercase letters (default: true)',
              },
              include_numbers: {
                type: 'boolean',
                description: 'Include numbers (default: true)',
              },
              include_symbols: {
                type: 'boolean',
                description: 'Include symbols (default: true)',
              },
              exclude_similar: {
                type: 'boolean',
                description: 'Exclude similar characters (il1Lo0O) (default: false)',
              },
            },
          },
        },
        {
          name: 'format_bytes',
          description: 'Format bytes to human-readable format (binary or decimal)',
          inputSchema: {
            type: 'object',
            properties: {
              bytes: {
                type: 'number',
                description: 'Number of bytes to format',
              },
              format: {
                type: 'string',
                enum: ['binary', 'decimal'],
                description: 'Format type: binary (1024-based) or decimal (1000-based) (default: binary)',
              },
              precision: {
                type: 'number',
                description: 'Number of decimal places (0-10, default: 2)',
                minimum: 0,
                maximum: 10,
              },
            },
            required: ['bytes'],
          },
        },
        // Phase 3: Medium priority functions
        {
          name: 'format_number',
          description: 'Format numbers (currency, percentage, thousands separator, decimal)',
          inputSchema: {
            type: 'object',
            properties: {
              number: {
                type: 'number',
                description: 'Number to format',
              },
              format: {
                type: 'string',
                enum: ['currency', 'percentage', 'thousands', 'decimal'],
                description: 'Format type',
              },
              locale: {
                type: 'string',
                description: 'Locale (default: en-US)',
              },
              currency: {
                type: 'string',
                description: 'Currency code for currency format (default: USD)',
              },
              minimum_fraction_digits: {
                type: 'number',
                description: 'Minimum fraction digits (0-20)',
                minimum: 0,
                maximum: 20,
              },
              maximum_fraction_digits: {
                type: 'number',
                description: 'Maximum fraction digits (0-20)',
                minimum: 0,
                maximum: 20,
              },
            },
            required: ['number', 'format'],
          },
        },
        {
          name: 'convert_color',
          description: 'Convert between color formats (hex, RGB, HSL)',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Color value to convert',
              },
              from: {
                type: 'string',
                enum: ['hex', 'rgb', 'hsl'],
                description: 'Source color format',
              },
              to: {
                type: 'string',
                enum: ['hex', 'rgb', 'hsl'],
                description: 'Target color format',
              },
            },
            required: ['input', 'from', 'to'],
          },
        },
        {
          name: 'convert_timezone',
          description: 'Convert datetime between timezones',
          inputSchema: {
            type: 'object',
            properties: {
              datetime: {
                type: 'string',
                description: 'Datetime string to convert',
              },
              from_timezone: {
                type: 'string',
                description: 'Source timezone (default: UTC)',
              },
              to_timezone: {
                type: 'string',
                description: 'Target timezone',
              },
              format: {
                type: 'string',
                description: 'Output format (optional)',
              },
            },
            required: ['datetime', 'to_timezone'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_current_datetime':
            if (!isValidGetDateTimeArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for get_current_datetime'
              );
            }
            return this.handleGetCurrentDateTime(args);

          case 'get_os_version':
            return this.handleGetOSVersion();

          case 'calculate_math_expression':
            if (!isValidCalculateMathExpressionArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for calculate_math_expression: expression must be a non-empty string'
              );
            }
            return this.handleCalculateMathExpression(args);

          case 'hash_string':
            if (!isValidHashStringArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for hash_string: input must be a non-empty string'
              );
            }
            return this.handleHashString(args);

          // Unified random generation (replaces random_string and generate_uuid)
          case 'generate_random':
            if (!isValidGenerateRandomArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for generate_random: type must be uuid, hex, base64, or bytes'
              );
            }
            return this.handleGenerateRandom(args);

          case 'encode_base64':
            if (!isValidEncodeBase64Args(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for encode_base64: input must be a non-empty string'
              );
            }
            return this.handleEncodeBase64(args);

          case 'decode_base64':
            if (!isValidDecodeBase64Args(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for decode_base64: input must be a non-empty string'
              );
            }
            return this.handleDecodeBase64(args);

          case 'encode_url':
            if (!isValidEncodeUrlArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for encode_url: input must be a non-empty string'
              );
            }
            return this.handleEncodeUrl(args);

          case 'decode_url':
            if (!isValidDecodeUrlArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for decode_url: input must be a non-empty string'
              );
            }
            return this.handleDecodeUrl(args);

          case 'format_text_case':
            if (!isValidFormatTextCaseArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for format_text_case: input must be a non-empty string'
              );
            }
            return this.handleFormatTextCase(args);

          case 'generate_slug':
            if (!isValidGenerateSlugArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for generate_slug: input must be a non-empty string'
              );
            }
            return this.handleGenerateSlug(args);

          case 'validate_data':
            if (!isValidValidateDataArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for validate_data: input must be a non-empty string and type must be valid'
              );
            }
            return this.handleValidateData(args);

          case 'format_json':
            if (!isValidFormatJsonArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for format_json: input must be a non-empty string and action must be valid'
              );
            }
            return this.handleFormatJson(args);

          // Phase 2: High priority functions
          case 'generate_password':
            if (!isValidGeneratePasswordArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for generate_password: length must be between 8 and 128'
              );
            }
            return this.handleGeneratePassword(args);

          case 'format_bytes':
            if (!isValidFormatBytesArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for format_bytes: bytes must be a non-negative number'
              );
            }
            return this.handleFormatBytes(args);

          // Phase 3: Medium priority functions
          case 'format_number':
            if (!isValidFormatNumberArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for format_number: number must be finite and format must be valid'
              );
            }
            return this.handleFormatNumber(args);

          case 'convert_color':
            if (!isValidConvertColorArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for convert_color: input must be a non-empty string and formats must be valid'
              );
            }
            return this.handleConvertColor(args);

          case 'convert_timezone':
            if (!isValidConvertTimezoneArgs(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid arguments for convert_timezone: datetime and to_timezone must be non-empty strings'
              );
            }
            return this.handleConvertTimezone(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private handleGetCurrentDateTime(args: GetDateTimeArgs) {
    const now = new Date();
    
    // Format time components
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    const result: any = {
      utc: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: `${hours}:${minutes}:${seconds}`,
      datetime: `${now.toISOString().split('T')[0]} ${hours}:${minutes}:${seconds}`,
      unix_timestamp_seconds: Math.floor(now.getTime() / 1000),
      unix_timestamp_milliseconds: now.getTime(),
      human_readable_utc0: now.toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      human_readable_utc3_moscow: now.toLocaleString('en-US', {
        timeZone: 'Europe/Moscow',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private handleGetOSVersion() {
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();
    const type = os.type();
    const userInfo = os.userInfo();

    const osInfo: any = {
      platform,
      release,
      architecture: arch,
      type,
      hostname: os.hostname(),
      username: userInfo.username,
      homedir: os.homedir(),
    };

    // Add platform-specific information
    if (platform === 'darwin') {
      osInfo.platformName = 'macOS';
    } else if (platform === 'win32') {
      osInfo.platformName = 'Windows';
    } else if (platform === 'linux') {
      osInfo.platformName = 'Linux';
    }

    // Add user ID and group ID (Unix systems)
    if (platform !== 'win32') {
      osInfo.uid = userInfo.uid;
      osInfo.gid = userInfo.gid;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(osInfo, null, 2),
        },
      ],
    };
  }

  private handleCalculateMathExpression(args: CalculateMathExpressionArgs) {
    const trimmedExpression = args.expression.trim();

    // Validate expression is not empty after trimming
    if (trimmedExpression.length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Expression cannot be empty or whitespace-only'
      );
    }

    try {
      // Parse the expression
      const expr = this.parser.parse(trimmedExpression);

      // Evaluate the expression (no variables needed for basic calculations)
      const result = expr.evaluate({});

      // Check for invalid results (NaN, Infinity)
      if (!Number.isFinite(result)) {
        if (Number.isNaN(result)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Expression evaluation resulted in NaN (Not a Number). Please check your expression syntax.'
          );
        } else if (!Number.isFinite(result)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Expression evaluation resulted in Infinity. The result is too large or involves division by zero.'
          );
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                result,
                expression: trimmedExpression,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      // Handle parsing errors
      if (error instanceof Error) {
        // Check for division by zero or other evaluation errors
        if (error.message.includes('division') || error.message.includes('zero')) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Division by zero is not allowed'
          );
        }

        // Handle parse errors
        if (error.message.includes('parse') || error.message.includes('syntax')) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid expression syntax: ${error.message}`
          );
        }

        // Generic error
        throw new McpError(
          ErrorCode.InvalidParams,
          `Error evaluating expression: ${error.message}`
        );
      }

      // Fallback for unknown errors
      throw new McpError(
        ErrorCode.InternalError,
        'An unexpected error occurred while evaluating the expression'
      );
    }
  }

  // Unified random generation handler (replaces handleRandomString and handleGenerateUuid)
  private async handleGenerateRandom(args: GenerateRandomArgs) {
    try {
      const result = await randomUtils.generateRandom(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Random generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleHashString(args: HashStringArgs) {
    const input = args.input.trim();

    if (input.length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Input string cannot be empty or whitespace-only'
      );
    }

    // Generate SHA256 hash
    const hash256 = crypto.createHash('sha256').update(input).digest('hex');
    const hash256Base64 = crypto.createHash('sha256').update(input).digest('base64');

    // Generate SHA512 hash
    const hash512 = crypto.createHash('sha512').update(input).digest('hex');
    const hash512Base64 = crypto.createHash('sha512').update(input).digest('base64');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              input,
              sha256_hex: hash256,
              sha256_base64: hash256Base64,
              sha512_hex: hash512,
              sha512_base64: hash512Base64,
            },
            null,
            2
          ),
        },
      ],
    };
  }


  private handleEncodeBase64(args: EncodeBase64Args) {
    try {
      const result = encodingUtils.encodeBase64(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Base64 encoding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleDecodeBase64(args: DecodeBase64Args) {
    try {
      const result = encodingUtils.decodeBase64(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Base64 decoding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleEncodeUrl(args: EncodeUrlArgs) {
    try {
      const result = encodingUtils.encodeUrl(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `URL encoding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleDecodeUrl(args: DecodeUrlArgs) {
    try {
      const result = encodingUtils.decodeUrl(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `URL decoding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleFormatTextCase(args: FormatTextCaseArgs) {
    try {
      const result = textUtils.formatTextCase(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Text case formatting failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleGenerateSlug(args: GenerateSlugArgs) {
    try {
      const result = textUtils.generateSlug(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Slug generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleValidateData(args: ValidateDataArgs) {
    try {
      const result = validationUtils.validateData(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Data validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleFormatJson(args: FormatJsonArgs) {
    try {
      const result = jsonUtils.formatJson(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `JSON formatting failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Phase 2: High priority function handlers
  private handleGeneratePassword(args: GeneratePasswordArgs) {
    try {
      const result = passwordUtils.generatePassword(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Password generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleFormatBytes(args: FormatBytesArgs) {
    try {
      const result = bytesUtils.formatBytes(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Bytes formatting failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Phase 3: Medium priority function handlers
  private handleFormatNumber(args: FormatNumberArgs) {
    try {
      const result = numberUtils.formatNumber(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Number formatting failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleConvertColor(args: ConvertColorArgs) {
    try {
      const result = colorUtils.convertColor(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Color conversion failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private handleConvertTimezone(args: ConvertTimezoneArgs) {
    try {
      const result = timezoneUtils.convertTimezone(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Timezone conversion failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sys8 MCP server running on stdio');
  }
}

const server = new SystemInfoServer();
server.run().catch(console.error);
