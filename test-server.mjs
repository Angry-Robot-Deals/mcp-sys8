#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCP() {
  console.log('🚀 Starting Sys8 MCP Server Tests\n');

  const client = new Client({
    name: 'test-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  // Start the server process
  const serverPath = join(__dirname, 'src', 'index.ts');
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', serverPath],
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP server\n');

    // Test 1: get_current_datetime - Check all formats
    console.log('🕐 Test 1: get_current_datetime - All formats');
    try {
      const result1 = await client.callTool({
        name: 'get_current_datetime',
        arguments: {},
      });
      const data = JSON.parse(result1.content[0].text);
      console.log('Result:', result1.content[0].text);
      
      // Verify all required formats are present
      const requiredFields = [
        'utc', 'date', 'time', 'datetime',
        'unix_timestamp_seconds', 'unix_timestamp_milliseconds',
        'human_readable_utc0', 'human_readable_utc3_moscow'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in data));
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ get_current_datetime: PASSED (all formats present)\n');
    } catch (error) {
      console.error('❌ get_current_datetime: FAILED', error);
    }

    // Test 2: get_os_version - Check user information
    console.log('💻 Test 2: get_os_version - User information');
    try {
      const result2 = await client.callTool({
        name: 'get_os_version',
        arguments: {},
      });
      const data = JSON.parse(result2.content[0].text);
      console.log('Result:', result2.content[0].text);
      
      // Verify user information fields
      const requiredFields = ['username', 'homedir', 'hostname'];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ get_os_version: PASSED (user info present)\n');
    } catch (error) {
      console.error('❌ get_os_version: FAILED', error);
    }

    // Test 3: calculate_math_expression - Simple arithmetic
    console.log('🔢 Test 3: calculate_math_expression - Simple arithmetic');
    try {
      const result3 = await client.callTool({
        name: 'calculate_math_expression',
        arguments: { expression: '2 + 2' },
      });
      const data = JSON.parse(result3.content[0].text);
      if (data.result !== 4) {
        throw new Error(`Expected 4, got ${data.result}`);
      }
      console.log('Result (2 + 2):', result3.content[0].text);
      console.log('✅ calculate_math_expression (simple): PASSED\n');
    } catch (error) {
      console.error('❌ calculate_math_expression (simple): FAILED', error);
    }

    // Test 4: calculate_math_expression - Complex expression
    console.log('🔢 Test 4: calculate_math_expression - Complex expression');
    try {
      const result4 = await client.callTool({
        name: 'calculate_math_expression',
        arguments: { expression: '(10 + 5) * 3 / 2' },
      });
      const data = JSON.parse(result4.content[0].text);
      if (data.result !== 22.5) {
        throw new Error(`Expected 22.5, got ${data.result}`);
      }
      console.log('Result ((10 + 5) * 3 / 2):', result4.content[0].text);
      console.log('✅ calculate_math_expression (complex): PASSED\n');
    } catch (error) {
      console.error('❌ calculate_math_expression (complex): FAILED', error);
    }

    // Test 5: calculate_math_expression - Functions
    console.log('🔢 Test 5: calculate_math_expression - Functions');
    try {
      const result5 = await client.callTool({
        name: 'calculate_math_expression',
        arguments: { expression: 'sqrt(16)' },
      });
      const data = JSON.parse(result5.content[0].text);
      if (data.result !== 4) {
        throw new Error(`Expected 4, got ${data.result}`);
      }
      console.log('Result (sqrt(16)):', result5.content[0].text);
      console.log('✅ calculate_math_expression (functions): PASSED\n');
    } catch (error) {
      console.error('❌ calculate_math_expression (functions): FAILED', error);
    }

    // Test 6: calculate_math_expression - Division by zero (error case)
    console.log('🔢 Test 6: calculate_math_expression - Division by zero (error case)');
    try {
      const result6 = await client.callTool({
        name: 'calculate_math_expression',
        arguments: { expression: '5 / 0' },
      });
      console.log('Result (5 / 0):', result6.content[0].text);
      console.log('⚠️  calculate_math_expression (division by zero): Should have failed but did not\n');
    } catch (error) {
      console.log('✅ calculate_math_expression (division by zero): Correctly failed');
      console.log('Error message:', error.message);
      console.log('');
    }

    // Test 7: calculate_math_expression - Invalid syntax (error case)
    console.log('🔢 Test 7: calculate_math_expression - Invalid syntax (error case)');
    try {
      const result7 = await client.callTool({
        name: 'calculate_math_expression',
        arguments: { expression: '2 +' },
      });
      console.log('Result (2 +):', result7.content[0].text);
      console.log('⚠️  calculate_math_expression (invalid syntax): Should have failed but did not\n');
    } catch (error) {
      console.log('✅ calculate_math_expression (invalid syntax): Correctly failed');
      console.log('Error message:', error.message);
      console.log('');
    }

    // Test 8: generate_random - Hex (all lengths)
    console.log('🎲 Test 8: generate_random - Hex (all lengths)');
    try {
      const result8 = await client.callTool({
        name: 'generate_random',
        arguments: { type: 'hex' },
      });
      const data = JSON.parse(result8.content[0].text);
      console.log('Result:', result8.content[0].text);
      
      // Verify hex fields are present
      if (!data.hex || typeof data.hex !== 'object') {
        throw new Error('Missing or invalid hex field');
      }
      
      const hexFields = Object.keys(data.hex);
      if (hexFields.length === 0) {
        throw new Error('No hex values generated');
      }
      
      console.log('✅ generate_random (hex): PASSED\n');
    } catch (error) {
      console.error('❌ generate_random (hex): FAILED', error);
    }

    // Test 8b: generate_random - UUID
    console.log('🆔 Test 8b: generate_random - UUID');
    try {
      const result8b = await client.callTool({
        name: 'generate_random',
        arguments: { type: 'uuid' },
      });
      const data = JSON.parse(result8b.content[0].text);
      console.log('Result:', result8b.content[0].text);
      
      // Verify UUID fields are present
      if (!data.uuid || typeof data.uuid !== 'object') {
        throw new Error('Missing or invalid uuid field');
      }
      
      const requiredUuidFields = ['standard', 'uppercase', 'without_dashes'];
      const missingFields = requiredUuidFields.filter(field => !(field in data.uuid));
      if (missingFields.length > 0) {
        throw new Error(`Missing UUID fields: ${missingFields.join(', ')}`);
      }
      
      // Verify UUID format
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(data.uuid.standard)) {
        throw new Error(`Invalid UUID format: ${data.uuid.standard}`);
      }
      
      console.log('✅ generate_random (uuid): PASSED\n');
    } catch (error) {
      console.error('❌ generate_random (uuid): FAILED', error);
    }

    // Test 9: hash_string - Simple hash
    console.log('🔐 Test 9: hash_string - Simple hash');
    try {
      const result9 = await client.callTool({
        name: 'hash_string',
        arguments: { input: 'test string' },
      });
      const data = JSON.parse(result9.content[0].text);
      console.log('Result:', result9.content[0].text);
      
      // Verify all hash formats are present
      const requiredFields = [
        'input', 'sha256_hex', 'sha256_base64', 'sha512_hex', 'sha512_base64'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in data));
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }
      
      // Verify hash format (hex should be 64 chars for SHA256, 128 for SHA512)
      if (data.sha256_hex.length !== 64) {
        throw new Error(`SHA256 hex should be 64 chars, got ${data.sha256_hex.length}`);
      }
      if (data.sha512_hex.length !== 128) {
        throw new Error(`SHA512 hex should be 128 chars, got ${data.sha512_hex.length}`);
      }
      
      console.log('✅ hash_string: PASSED\n');
    } catch (error) {
      console.error('❌ hash_string: FAILED', error);
    }

    // Test 10: hash_string - Empty input (error case)
    console.log('🔐 Test 10: hash_string - Empty input (error case)');
    try {
      const result10 = await client.callTool({
        name: 'hash_string',
        arguments: { input: '' },
      });
      console.log('Result (empty):', result10.content[0].text);
      console.log('⚠️  hash_string (empty input): Should have failed but did not\n');
    } catch (error) {
      console.log('✅ hash_string (empty input): Correctly failed');
      console.log('Error message:', error.message);
      console.log('');
    }

    // Test 11: validate_data - JSON
    console.log('✅ Test 11: validate_data - JSON');
    try {
      const result11 = await client.callTool({
        name: 'validate_data',
        arguments: { input: '{"key":"value","number":123}', type: 'json' },
      });
      const data = JSON.parse(result11.content[0].text);
      console.log('Result:', result11.content[0].text);
      
      if (!data.valid) {
        throw new Error('Valid JSON was marked as invalid');
      }
      
      if (!data.normalized || typeof data.normalized !== 'string') {
        throw new Error('Missing or invalid normalized field');
      }
      
      console.log('✅ validate_data (json): PASSED\n');
    } catch (error) {
      console.error('❌ validate_data (json): FAILED', error);
    }

    // Test 11b: validate_data - Invalid JSON
    console.log('✅ Test 11b: validate_data - Invalid JSON');
    try {
      const result11b = await client.callTool({
        name: 'validate_data',
        arguments: { input: '{"key":invalid}', type: 'json' },
      });
      const data = JSON.parse(result11b.content[0].text);
      console.log('Result:', result11b.content[0].text);
      
      if (data.valid) {
        throw new Error('Invalid JSON was marked as valid');
      }
      
      if (!data.error) {
        throw new Error('Missing error message for invalid JSON');
      }
      
      console.log('✅ validate_data (invalid json): PASSED\n');
    } catch (error) {
      console.error('❌ validate_data (invalid json): FAILED', error);
    }

    // Test 12: encode_base64
    console.log('📦 Test 12: encode_base64');
    try {
      const result12 = await client.callTool({
        name: 'encode_base64',
        arguments: { input: 'Hello World!' },
      });
      const data = JSON.parse(result12.content[0].text);
      console.log('Result:', result12.content[0].text);
      
      if (!data.encoded || typeof data.encoded !== 'string') {
        throw new Error('Missing or invalid encoded field');
      }
      
      // Verify it's valid base64
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Pattern.test(data.encoded)) {
        throw new Error(`Invalid Base64 format: ${data.encoded}`);
      }
      
      console.log('✅ encode_base64: PASSED\n');
    } catch (error) {
      console.error('❌ encode_base64: FAILED', error);
    }

    // Test 13: decode_base64
    console.log('📦 Test 13: decode_base64');
    try {
      const result13 = await client.callTool({
        name: 'decode_base64',
        arguments: { input: 'SGVsbG8gV29ybGQh' },
      });
      const data = JSON.parse(result13.content[0].text);
      console.log('Result:', result13.content[0].text);
      
      if (data.decoded !== 'Hello World!') {
        throw new Error(`Expected 'Hello World!', got '${data.decoded}'`);
      }
      
      console.log('✅ decode_base64: PASSED\n');
    } catch (error) {
      console.error('❌ decode_base64: FAILED', error);
    }

    // Test 14: format_text_case
    console.log('📝 Test 14: format_text_case');
    try {
      const result14 = await client.callTool({
        name: 'format_text_case',
        arguments: { input: 'hello world example' },
      });
      const data = JSON.parse(result14.content[0].text);
      console.log('Result:', result14.content[0].text);
      
      // Verify all formats are present
      const requiredFields = [
        'input', 'camelCase', 'PascalCase', 'kebab-case', 'snake_case',
        'CONSTANT_CASE', 'Title Case', 'lowercase', 'UPPERCASE'
      ];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }
      
      // Verify some expected values
      if (data.camelCase !== 'helloWorldExample') {
        throw new Error(`Expected 'helloWorldExample', got '${data.camelCase}'`);
      }
      if (data['kebab-case'] !== 'hello-world-example') {
        throw new Error(`Expected 'hello-world-example', got '${data['kebab-case']}'`);
      }
      
      console.log('✅ format_text_case: PASSED\n');
    } catch (error) {
      console.error('❌ format_text_case: FAILED', error);
    }

    // Test 15: validate_data - Email
    console.log('✅ Test 15: validate_data - Email');
    try {
      const result15 = await client.callTool({
        name: 'validate_data',
        arguments: { input: 'user@example.com', type: 'email' },
      });
      const data = JSON.parse(result15.content[0].text);
      console.log('Result:', result15.content[0].text);
      
      if (!data.valid) {
        throw new Error('Valid email was marked as invalid');
      }
      
      console.log('✅ validate_data (email): PASSED\n');
    } catch (error) {
      console.error('❌ validate_data (email): FAILED', error);
    }

    // Test 16: validate_data - Invalid email
    console.log('✅ Test 16: validate_data - Invalid email');
    try {
      const result16 = await client.callTool({
        name: 'validate_data',
        arguments: { input: 'not-an-email', type: 'email' },
      });
      const data = JSON.parse(result16.content[0].text);
      console.log('Result:', result16.content[0].text);
      
      if (data.valid) {
        throw new Error('Invalid email was marked as valid');
      }
      
      console.log('✅ validate_data (invalid email): PASSED\n');
    } catch (error) {
      console.error('❌ validate_data (invalid email): FAILED', error);
    }

    // Test 17: format_json - Format
    console.log('📄 Test 17: format_json - Format');
    try {
      const result17 = await client.callTool({
        name: 'format_json',
        arguments: { input: '{"key":"value","number":123}', action: 'format' },
      });
      const data = JSON.parse(result17.content[0].text);
      console.log('Result:', result17.content[0].text);
      
      if (!data.valid) {
        throw new Error('Valid JSON was marked as invalid');
      }
      
      if (!data.formatted || typeof data.formatted !== 'string') {
        throw new Error('Missing or invalid formatted field');
      }
      
      console.log('✅ format_json (format): PASSED\n');
    } catch (error) {
      console.error('❌ format_json (format): FAILED', error);
    }

    // Test 18: format_json - Invalid JSON
    console.log('📄 Test 18: format_json - Invalid JSON');
    try {
      const result18 = await client.callTool({
        name: 'format_json',
        arguments: { input: '{"key":invalid}', action: 'validate' },
      });
      const data = JSON.parse(result18.content[0].text);
      console.log('Result:', result18.content[0].text);
      
      if (data.valid) {
        throw new Error('Invalid JSON was marked as valid');
      }
      
      if (!data.error) {
        throw new Error('Missing error message for invalid JSON');
      }
      
      console.log('✅ format_json (invalid): PASSED\n');
    } catch (error) {
      console.error('❌ format_json (invalid): FAILED', error);
    }

    // Test 19: generate_password - Default
    console.log('🔑 Test 19: generate_password - Default');
    try {
      const result19 = await client.callTool({
        name: 'generate_password',
        arguments: {},
      });
      const data = JSON.parse(result19.content[0].text);
      console.log('Result:', result19.content[0].text);
      
      if (!data.password || typeof data.password !== 'string') {
        throw new Error('Missing or invalid password field');
      }
      
      if (data.password.length !== 16) {
        throw new Error(`Expected password length 16, got ${data.password.length}`);
      }
      
      if (!['weak', 'medium', 'strong', 'very-strong'].includes(data.strength)) {
        throw new Error(`Invalid strength value: ${data.strength}`);
      }
      
      console.log('✅ generate_password (default): PASSED\n');
    } catch (error) {
      console.error('❌ generate_password (default): FAILED', error);
    }

    // Test 20: generate_password - Custom
    console.log('🔑 Test 20: generate_password - Custom');
    try {
      const result20 = await client.callTool({
        name: 'generate_password',
        arguments: {
          length: 20,
          include_symbols: false,
          exclude_similar: true,
        },
      });
      const data = JSON.parse(result20.content[0].text);
      console.log('Result:', result20.content[0].text);
      
      if (data.password.length !== 20) {
        throw new Error(`Expected password length 20, got ${data.password.length}`);
      }
      
      // Check that similar characters are excluded
      if (/[il1Lo0O]/.test(data.password)) {
        throw new Error('Password contains excluded similar characters');
      }
      
      console.log('✅ generate_password (custom): PASSED\n');
    } catch (error) {
      console.error('❌ generate_password (custom): FAILED', error);
    }

    // Test 21: format_bytes - Binary
    console.log('📊 Test 21: format_bytes - Binary');
    try {
      const result21 = await client.callTool({
        name: 'format_bytes',
        arguments: {
          bytes: 1048576,
          format: 'binary',
        },
      });
      const data = JSON.parse(result21.content[0].text);
      console.log('Result:', result21.content[0].text);
      
      if (!data.formatted || typeof data.formatted !== 'string') {
        throw new Error('Missing or invalid formatted field');
      }
      
      if (!data.formatted.includes('MB')) {
        throw new Error(`Expected MB in formatted string, got: ${data.formatted}`);
      }
      
      if (data.megabytes !== 1) {
        throw new Error(`Expected 1 MB, got ${data.megabytes}`);
      }
      
      console.log('✅ format_bytes (binary): PASSED\n');
    } catch (error) {
      console.error('❌ format_bytes (binary): FAILED', error);
    }

    // Test 22: format_bytes - Decimal
    console.log('📊 Test 22: format_bytes - Decimal');
    try {
      const result22 = await client.callTool({
        name: 'format_bytes',
        arguments: {
          bytes: 1000000,
          format: 'decimal',
          precision: 1,
        },
      });
      const data = JSON.parse(result22.content[0].text);
      console.log('Result:', result22.content[0].text);
      
      if (!data.formatted_decimal || typeof data.formatted_decimal !== 'string') {
        throw new Error('Missing or invalid formatted_decimal field');
      }
      
      console.log('✅ format_bytes (decimal): PASSED\n');
    } catch (error) {
      console.error('❌ format_bytes (decimal): FAILED', error);
    }

    // Test 23: format_number - Currency
    console.log('💰 Test 23: format_number - Currency');
    try {
      const result23 = await client.callTool({
        name: 'format_number',
        arguments: {
          number: 1234.56,
          format: 'currency',
          currency: 'USD',
        },
      });
      const data = JSON.parse(result23.content[0].text);
      console.log('Result:', result23.content[0].text);
      
      if (!data.formatted || typeof data.formatted !== 'string') {
        throw new Error('Missing or invalid formatted field');
      }
      
      if (!data.formatted.includes('$')) {
        throw new Error('Currency format should include $ symbol');
      }
      
      console.log('✅ format_number (currency): PASSED\n');
    } catch (error) {
      console.error('❌ format_number (currency): FAILED', error);
    }

    // Test 24: format_number - Percentage
    console.log('📊 Test 24: format_number - Percentage');
    try {
      const result24 = await client.callTool({
        name: 'format_number',
        arguments: {
          number: 75.5,
          format: 'percentage',
        },
      });
      const data = JSON.parse(result24.content[0].text);
      console.log('Result:', result24.content[0].text);
      
      if (!data.formatted || typeof data.formatted !== 'string') {
        throw new Error('Missing or invalid formatted field');
      }
      
      if (!data.formatted.includes('%')) {
        throw new Error('Percentage format should include % symbol');
      }
      
      console.log('✅ format_number (percentage): PASSED\n');
    } catch (error) {
      console.error('❌ format_number (percentage): FAILED', error);
    }

    // Test 25: convert_color - Hex to RGB
    console.log('🎨 Test 25: convert_color - Hex to RGB');
    try {
      const result25 = await client.callTool({
        name: 'convert_color',
        arguments: {
          input: '#FF5733',
          from: 'hex',
          to: 'rgb',
        },
      });
      const data = JSON.parse(result25.content[0].text);
      console.log('Result:', result25.content[0].text);
      
      if (!data.hex || !data.rgb || !data.hsl) {
        throw new Error('Missing color format fields');
      }
      
      if (!data.rgb_array || !Array.isArray(data.rgb_array) || data.rgb_array.length !== 3) {
        throw new Error('Invalid rgb_array format');
      }
      
      // Verify RGB values for #FF5733 (255, 87, 51)
      if (data.rgb_array[0] !== 255 || data.rgb_array[1] !== 87 || data.rgb_array[2] !== 51) {
        throw new Error(`Expected RGB [255, 87, 51], got [${data.rgb_array.join(', ')}]`);
      }
      
      console.log('✅ convert_color (hex to rgb): PASSED\n');
    } catch (error) {
      console.error('❌ convert_color (hex to rgb): FAILED', error);
    }

    // Test 26: convert_timezone
    console.log('🌍 Test 26: convert_timezone');
    try {
      const result26 = await client.callTool({
        name: 'convert_timezone',
        arguments: {
          datetime: '2025-12-06T12:00:00Z',
          from_timezone: 'UTC',
          to_timezone: 'America/New_York',
        },
      });
      const data = JSON.parse(result26.content[0].text);
      console.log('Result:', result26.content[0].text);
      
      if (!data.converted_datetime || typeof data.converted_datetime !== 'string') {
        throw new Error('Missing or invalid converted_datetime field');
      }
      
      if (!data.iso_string || typeof data.iso_string !== 'string') {
        throw new Error('Missing or invalid iso_string field');
      }
      
      if (typeof data.unix_timestamp !== 'number') {
        throw new Error('Missing or invalid unix_timestamp field');
      }
      
      console.log('✅ convert_timezone: PASSED\n');
    } catch (error) {
      console.error('❌ convert_timezone: FAILED', error);
    }

    // List all tools
    console.log('📋 Listing all available tools:');
    const tools = await client.listTools();
    console.log('Available tools:', tools.tools.map(t => `- ${t.name}: ${t.description}`).join('\n'));
    console.log('');

    await client.close();
    console.log('✅ All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    await client.close();
    process.exit(1);
  }
}

testMCP().catch(console.error);
