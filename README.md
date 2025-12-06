# Sys8 MCP Server

MCP server for system information and developer utilities: date/time, OS version, math calculations, random data generation (UUID, hex, base64), hashing, text formatting, data validation (including JSON), encoding/decoding, and more.

**Version**: 0.4.0  
**License**: MIT

## Features

### System Information
- **Get Current DateTime**: Get the current date and time in all available formats (UTC, date string, time string, datetime string, Unix timestamps, human-readable formats)
- **Get OS Version**: Retrieve operating system version, platform information, and current user information

### Calculations & Security
- **Calculate Math Expression**: Safely evaluate mathematical expressions
- **Generate Random**: Generate random data (UUID v4, hex strings, base64 strings, or raw bytes)
- **Hash String**: Generate hashes for strings (useful for .env file keys)

### Developer Utilities (New in v0.4.0)
- **Encode/Decode Base64**: Encode and decode strings to/from Base64 format
- **Encode/Decode URL**: URL encoding and decoding for query strings and paths
- **Format Text Case**: Convert text to different case formats (camelCase, PascalCase, kebab-case, snake_case, CONSTANT_CASE, Title Case, lowercase, UPPERCASE)
- **Generate Slug**: Generate URL-friendly slugs from text
- **Validate Data**: Validate data against various formats (email, url, ipv4, ipv6, domain, phone, credit-card, uuid, hex, base64, json)
- **Format JSON**: Format, validate, minify, or prettify JSON strings
- **Generate Password**: Generate secure passwords with customizable options (length, character types, exclude similar)
- **Format Bytes**: Format bytes to human-readable format (binary or decimal)
- **Format Number**: Format numbers (currency, percentage, thousands separator, decimal)
- **Convert Color**: Convert between color formats (hex, RGB, HSL)
- **Convert Timezone**: Convert datetime between timezones

## Why MCP? Project Philosophy

### Why Use MCP Instead of LLM Agents?

This MCP server provides deterministic, reliable system utilities that should **never** be delegated to AI agents. Here's why:

#### 🎯 **Accuracy & Reliability**
- **AI agents make mistakes**: LLMs frequently hallucinate, miscalculate, and produce inconsistent results when handling mathematical operations, date/time conversions, or data validation
- **Deterministic algorithms**: These functions use proven, tested algorithms that always produce correct results
- **No ambiguity**: System information, calculations, and validations require precision that AI cannot guarantee

#### 💰 **Cost Efficiency**
- **Token savings**: Instead of sending complex calculations or validation logic to expensive LLM APIs, execute them locally via MCP
- **Reduced API calls**: One MCP tool call replaces multiple LLM reasoning steps
- **Faster responses**: Direct function execution is orders of magnitude faster than LLM processing

#### 🔒 **Security & Privacy**
- **Local execution**: Sensitive operations (hashing, password generation) run locally, not in cloud LLM services
- **No data leakage**: System information, calculations, and validations stay on your machine
- **Auditable code**: You can review and verify the exact algorithms being used

#### ⚡ **Performance**
- **Instant results**: Mathematical calculations, date/time operations, and validations execute in milliseconds
- **No network latency**: All operations run locally without API round-trips
- **Scalable**: Handle thousands of operations per second without rate limits

#### ✅ **Best Practices**
- **Separation of concerns**: Let AI handle reasoning and creativity; let algorithms handle computation and validation
- **Right tool for the job**: Use deterministic functions for deterministic tasks
- **Reliability**: Critical operations (UUID generation, password hashing, data validation) must be 100% reliable

**Example**: Instead of asking an LLM "What's the current time in UTC?", use `get_current_datetime` - it's faster, cheaper, and always accurate.

## Prerequisites

### System Requirements

#### For Local Installation
- **Node.js >= 24.0.0** (required)
  - Used for: All server functionality, UUID generation (via `crypto` module), date/time operations
- **npm** or compatible package manager (required)
  - Used for: Installing dependencies and building the project
- **openssl** (required for `generate_random` with hex/base64/bytes types)
  - Usually pre-installed on macOS and Linux
  - Windows: Install via [OpenSSL for Windows](https://slproweb.com/products/Win32OpenSSL.html) or use WSL
  - Used for: Cryptographically secure random string generation
  - **Note**: UUID generation via `generate_random` with `type: 'uuid'` does NOT require openssl (uses Node.js `crypto.randomUUID()`)

#### For Docker Installation
- **Docker** (required)
  - The Dockerfile automatically installs openssl in the container
  - Base image: `node:lts` (includes Node.js and npm)
  - Production image: `node:lts-slim` with openssl installed

### NPM Dependencies

The following packages are automatically installed via `npm install`:

- **@modelcontextprotocol/sdk** (v0.6.0)
  - Required for: MCP protocol implementation, server/client communication
- **expr-eval** (v2.0.2)
  - Required for: Safe mathematical expression evaluation in `calculate_math_expression`
  - Provides: Secure expression parsing without `eval()` security risks

### System Libraries Used

- **Node.js Built-in Modules** (no installation needed):
  - `crypto` - UUID generation, hashing (`hash_string`)
  - `os` - OS information (`get_os_version`)
  - `util` - Promise utilities for async operations
  - `child_process` - Executing openssl commands
  - `Buffer` - Base64 encoding/decoding, binary operations

- **System Commands**:
  - `openssl` - Random string generation (hex, base64, bytes)
    - Command: `openssl rand --hex <length>`
    - Command: `openssl rand <length> | openssl base64`

## Installation

### Local Installation

1. Navigate to the sys8 directory:
```bash
cd sys8
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

### Docker Installation

The sys8 MCP server is containerized and can be run using Docker.

**Docker Dependencies** (automatically installed in container):
- Node.js LTS (from `node:lts` base image)
- openssl (installed via `apt-get install openssl` in production stage)
- All npm dependencies from `package.json`

#### Building the Docker Image

```bash
cd sys8
docker build -t sys8:latest .
```

#### Running the Container

The sys8 MCP server uses stdio protocol for communication, so it should be run interactively:

```bash
docker run --rm -i sys8:latest
```

#### Using with Docker Desktop MCP Toolkit

The sys8 server is designed to be used with Docker Desktop MCP Toolkit. After building the image, you can configure it in Docker Desktop's MCP settings.

**Note**: For production use in Docker Registry, the server will be available through Docker Desktop MCP Toolkit after publication.

## Usage

### Available Tools

#### 1. `get_current_datetime`
Get the current date and time in all available formats.

**Parameters:** None

**Example:**
```json
{
  "name": "get_current_datetime",
  "arguments": {}
}
```

**Response:**
```json
{
  "utc": "2025-11-30T10:27:35.291Z",
  "date": "2025-11-30",
  "time": "10:27:35",
  "datetime": "2025-11-30 10:27:35",
  "unix_timestamp_seconds": 1764498455,
  "unix_timestamp_milliseconds": 1764498455291,
  "human_readable_utc0": "11/30/2025, 10:27:35",
  "human_readable_utc3_moscow": "11/30/2025, 13:27:35"
}
```

**Response Fields:**
- `utc`: ISO 8601 UTC datetime string
- `date`: Date string in YYYY-MM-DD format
- `time`: Time string in HH:mm:ss format
- `datetime`: Combined date and time string
- `unix_timestamp_seconds`: Unix timestamp in seconds
- `unix_timestamp_milliseconds`: Unix timestamp in milliseconds
- `human_readable_utc0`: Human-readable format in UTC+0
- `human_readable_utc3_moscow`: Human-readable format in UTC+3 (Moscow timezone)

#### 2. `get_os_version`
Get the operating system version, platform information, and current user information.

**Parameters:** None

**Example:**
```json
{
  "name": "get_os_version",
  "arguments": {}
}
```

**Response:**
```json
{
  "platform": "darwin",
  "release": "25.1.0",
  "architecture": "arm64",
  "type": "Darwin",
  "hostname": "mac.local",
  "username": "ug",
  "homedir": "/Users/ug",
  "platformName": "macOS",
  "uid": 501,
  "gid": 20
}
```

**Response Fields:**
- `platform`: Platform identifier (darwin, win32, linux)
- `release`: OS release version
- `architecture`: CPU architecture
- `type`: OS type
- `hostname`: System hostname
- `username`: Current user name
- `homedir`: User home directory
- `platformName`: Human-readable platform name (macOS, Windows, Linux)
- `uid`: User ID (Unix systems only)
- `gid`: Group ID (Unix systems only)

#### 3. `calculate_math_expression`
Calculate a mathematical expression safely.

**Parameters:**
- `expression` (required, string): Mathematical expression to evaluate (e.g., "2 + 2", "(10 + 5) * 3 / 2", "sqrt(16)")

**Supported Operations:**
- **Arithmetic**: `+`, `-`, `*`, `/`, `%` (modulo), `^` (power)
- **Functions**: `abs`, `ceil`, `floor`, `round`, `max`, `min`, `sqrt`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `log`, `exp`
- **Constants**: `PI`, `E`
- **Parentheses**: Full support for grouping expressions
- **Precedence**: Standard mathematical operator precedence

**Example:**
```json
{
  "name": "calculate_math_expression",
  "arguments": {
    "expression": "2 + 2"
  }
}
```

**Response:**
```json
{
  "result": 4,
  "expression": "2 + 2"
}
```

**More Examples:**
- Simple arithmetic: `"2 + 2"` → `4`
- Complex expression: `"(10 + 5) * 3 / 2"` → `22.5`
- Decimal operations: `"3.14 * 2"` → `6.28`
- Negative numbers: `"-5 + 3"` → `-2`
- Functions: `"sqrt(16)"` → `4`, `"sin(PI/2)"` → `1`
- Power: `"2^3"` → `8`

**Error Handling:**
- Invalid syntax: Returns error with clear message
- Division by zero: Returns error "Division by zero is not allowed"
- Empty expression: Returns error "Expression cannot be empty or whitespace-only"
- Invalid operations: Returns error with description

#### 4. `generate_random`
Generate random data: UUID v4, hex strings, base64 strings, or raw bytes.

**Parameters:**
- `type` (string, required): Type of random data - `'uuid'` | `'hex'` | `'base64'` | `'bytes'`
- `length` (number, optional): Length in bytes for hex/base64/bytes (8-128, default: generates all standard lengths)
- `format` (string, optional): Format for UUID only - `'standard'` | `'uppercase'` | `'without-dashes'` (default: returns all formats)

**Example (UUID):**
```json
{
  "name": "generate_random",
  "arguments": {
    "type": "uuid"
  }
}
```

**Response (UUID):**
```json
{
  "type": "uuid",
  "value": "550e8400-e29b-41d4-a716-446655440000",
  "uuid": {
    "standard": "550e8400-e29b-41d4-a716-446655440000",
    "uppercase": "550E8400-E29B-41D4-A716-446655440000",
    "without_dashes": "550e8400e29b41d4a716446655440000"
  }
}
```

**Example (Hex - all lengths):**
```json
{
  "name": "generate_random",
  "arguments": {
    "type": "hex"
  }
}
```

**Response (Hex - all lengths):**
```json
{
  "type": "hex",
  "value": "84A7B45B6BD20D97",
  "hex": {
    "hex_8_uppercase": "84A7B45B6BD20D97",
    "hex_16_uppercase": "4F76E8D72DFC73D01697F31B65910C19",
    "hex_32_uppercase": "57FCAA273E858F6CA7A467A8E233727F913C799E8B51E8B27EF04B90BBD4C2F4",
    "hex_64_uppercase": "5F2DCD116CEF205127445A5134D8008E3556CBDCC4759E89DA540C043E3B68B34A20A55587D375069BC38A97404E12C3FCEB42C8BB09E4C7651059107B2B9EFD"
  }
}
```

**Example (Base64 - specific length):**
```json
{
  "name": "generate_random",
  "arguments": {
    "type": "base64",
    "length": 32
  }
}
```

**Response (Base64 - specific length):**
```json
{
  "type": "base64",
  "value": "Yf1uDqalYr67AEtjTR/LxWj2zza/b7iUyHGNRpXPUAA=",
  "base64": {
    "base64_32": "Yf1uDqalYr67AEtjTR/LxWj2zza/b7iUyHGNRpXPUAA="
  }
}
```

**Note:** 
- UUID generation uses Node.js crypto and doesn't require openssl
- Hex, base64, and bytes generation require openssl to be installed
- If openssl is not available, hex/base64/bytes generation will return an error

#### 5. `hash_string`
Generate hash for a string (useful for .env file keys).

**Parameters:**
- `input` (required, string): String to hash

**Example:**
```json
{
  "name": "hash_string",
  "arguments": {
    "input": "my-secret-key"
  }
}
```

**Response:**
```json
{
  "input": "my-secret-key",
  "sha256_hex": "d5579c46dfcc7f18207013e65b44e4cb4e2c2298f4ac457ba8f82743f31e930b",
  "sha256_base64": "1VecRt/MfxggcBPmW0Tky04sIpj0rEV7qPgnQ/Mekws=",
  "sha512_hex": "10e6d647af44624442f388c2c14a787ff8b17e6165b83d767ec047768d8cbcb71a1a3226e7cc7816bc79c0427d94a9da688c41a3992c7bf5e4d7cc3e0be5dbac",
  "sha512_base64": "EObWR69EYkRC84jCwUp4f/ixfmFluD12fsBHdo2MvLcaGjIm58x4Frx5wEJ9lKnaaIxBo5kse/Xk18w+C+XbrA=="
}
```

**Response Fields:**
- `input`: Original input string
- `sha256_hex`: SHA256 hash in hexadecimal format (64 characters)
- `sha256_base64`: SHA256 hash in base64 format
- `sha512_hex`: SHA512 hash in hexadecimal format (128 characters)
- `sha512_base64`: SHA512 hash in base64 format

**Error Handling:**
- Empty input: Returns error "Input string cannot be empty or whitespace-only"

## Configuration for Cursor AI

### Global Configuration (All Users and Projects) - Recommended

To configure this MCP server for use in Cursor AI globally (for all users and projects), you need to add it to the global MCP configuration file.

#### Option 1: Using tsx (Recommended for Development)

This approach runs TypeScript directly without compilation, similar to other MCP servers. It's more convenient during development.

**macOS/Linux:**
1. Create or edit the global MCP configuration file:
```bash
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage
nano ~/Library/Application\ Support/Cursor/User/globalStorage/mcp.json
```

Or alternatively:
```bash
mkdir -p ~/.cursor
nano ~/.cursor/mcp.json
```

2. Add the following configuration:

```json
{
  "mcpServers": {
    "sys8": {
      "command": "npx",
      "args": ["tsx", "/Users/ug/code/AI/mcp/sys8/src/index.ts"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "sys8": {
      "command": "npx",
      "args": ["tsx", "C:\\path\\to\\mcp\\sys8\\src\\index.ts"]
    }
  }
}
```

**Important:** Replace the path with the absolute path to your `src/index.ts` file.

#### Option 2: Using Compiled JavaScript (Production)

This approach uses the compiled JavaScript file. Requires running `npm run build` after code changes.

**macOS/Linux:**
1. Create or edit the global MCP configuration file:
```bash
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage
nano ~/Library/Application\ Support/Cursor/User/globalStorage/mcp.json
```

2. Add the following configuration:

```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["/Users/ug/code/AI/mcp/sys8/build/index.js"]
    }
  }
}
```

**Important:** Replace `/Users/ug/code/AI/mcp/sys8/build/index.js` with the absolute path to your `build/index.js` file.

#### Linux

1. Create or edit the global MCP configuration file:
```bash
mkdir -p ~/.config/Cursor/User/globalStorage
nano ~/.config/Cursor/User/globalStorage/mcp.json
```

Or alternatively:
```bash
mkdir -p ~/.cursor
nano ~/.cursor/mcp.json
```

2. Add the configuration as shown above for macOS.

#### Windows

1. Create or edit the global MCP configuration file:
```
%APPDATA%\Cursor\User\globalStorage\mcp.json
```

Or alternatively:
```
%USERPROFILE%\.cursor\mcp.json
```

2. Add the following configuration (use Windows path format):

```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp\\sys8\\build\\index.js"]
    }
  }
}
```

**Note:** Use double backslashes (`\\`) or forward slashes (`/`) in Windows paths.

### Project-Specific Configuration

If you prefer to configure it per-project, create or edit `.cursor/mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["/absolute/path/to/sys8/build/index.js"]
    }
  }
}
```

**Example:** If your project is at `/Users/ug/code/AI/mcp`, you can use:

```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["./sys8/build/index.js"]
    }
  }
}
```

### Alternative: Using npm link (For Development)

If you want to use the server from anywhere without specifying the full path:

1. In the sys8 directory:
```bash
npm link
```

2. Then in the configuration, use:
```json
{
  "mcpServers": {
    "sys8": {
      "command": "sys8"
    }
  }
}
```

### Verifying Configuration

After adding the configuration:

1. Restart Cursor AI
2. The MCP server should be automatically loaded
3. You can verify it's working by using the tools in Cursor AI chat

### Example Configuration File

See `cursor-mcp-config-example.json` in this directory for a complete example configuration.

## Testing

### Automated Tests

Run the automated test suite to verify all functions:

```bash
npm test
```

This will test all 18 tools:
- `get_current_datetime` - all available formats
- `get_os_version` - OS information and user details
- `calculate_math_expression` - simple arithmetic, complex expressions, functions, and error cases
- `hash_string` - SHA256 and SHA512 hashes in hex and base64 formats
- `generate_random` - UUID v4, hex strings, base64 strings, or raw bytes generation
- `encode_base64` / `decode_base64` - Base64 encoding/decoding
- `encode_url` / `decode_url` - URL encoding/decoding
- `format_text_case` - text case conversion (camelCase, kebab-case, etc.)
- `generate_slug` - URL-friendly slug generation
- `validate_data` - data validation (email, URL, IP, JSON, etc.)
- `format_json` - JSON formatting, validation, and minification
- `generate_password` - secure password generation with customizable options
- `format_bytes` - bytes formatting to human-readable format (binary/decimal)
- `format_number` - number formatting (currency, percentage, thousands, decimal)
- `convert_color` - color conversion (hex, RGB, HSL)
- `convert_timezone` - timezone conversion

### MCP Inspector

Test the server interactively using the MCP Inspector:

```bash
npm run inspector
```

This opens an interactive interface where you can test each tool manually.

### Manual Testing

You can also run the server directly:

```bash
node build/index.js
```

Or using tsx:

```bash
npx tsx src/index.ts
```

## Development

- **Watch mode**: `npm run watch` - Automatically rebuilds on file changes
- **Build**: `npm run build` - Compiles TypeScript to JavaScript
- **Inspector**: `npm run inspector` - Runs MCP Inspector for testing

## Limitations & Requirements

### System Dependencies
- **openssl**: Required for `generate_random` with `type: 'hex'`, `type: 'base64'`, or `type: 'bytes'`
  - Must be installed and accessible in system PATH
  - Usually pre-installed on macOS and Linux
  - Windows: Install separately or use WSL
  - **UUID generation** (`generate_random` with `type: 'uuid'`) does NOT require openssl (uses Node.js `crypto.randomUUID()`)
- **Node.js >= 24.0.0**: Required for all functionality
  - Provides built-in `crypto` module for UUID and hashing
  - Provides `os` module for system information
  - Provides `Buffer` for encoding/decoding operations

### Functional Limitations
- **OS version information**: Based on Node.js `os` module capabilities (may vary by platform)
- **Date/time information**: 
  - `get_current_datetime` returns all formats in UTC timezone
  - Uses system timezone settings for conversions
- **Mathematical expressions**: Limited to operations supported by `expr-eval` library
  - Supports: arithmetic, trigonometry, logarithms, power operations
  - Does NOT support: complex numbers, matrix operations, symbolic math
  - Security: Uses safe parser configuration to prevent code injection (no variables, logical operators, or comparison operators)
- **Hashing algorithms**: Only SHA256 and SHA512 available (via `hash_string`)
  - Other algorithms (MD5, SHA1, etc.) not provided for security reasons

## License

Private project - not for distribution.

