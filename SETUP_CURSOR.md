# Sys8 MCP Setup for Cursor AI

**Requirements:** Node.js >= 24.0.0

## Quick Setup (globally for all projects)

### Option 1: Via tsx (Recommended for development)

This option runs TypeScript directly, as in other MCP servers. Does not require compilation.

**macOS/Linux:**

1. Create or edit the configuration file:
```bash
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage
nano ~/Library/Application\ Support/Cursor/User/globalStorage/mcp.json
```

2. Add the following configuration (replace the path with yours):
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

3. Restart Cursor AI

### Option 2: Via compiled JavaScript

This option uses a compiled file. Requires running `npm run build` after changes.

**macOS/Linux:**

1. Create or edit the configuration file:
```bash
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage
nano ~/Library/Application\ Support/Cursor/User/globalStorage/mcp.json
```

2. Add the following configuration (replace the path with yours):
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

3. Restart Cursor AI

### Linux

1. Create or edit the configuration file:
```bash
mkdir -p ~/.config/Cursor/User/globalStorage
nano ~/.config/Cursor/User/globalStorage/mcp.json
```

2. Add configuration as in the macOS example

3. Restart Cursor AI

### Windows

1. Create or edit the file:
```
%APPDATA%\Cursor\User\globalStorage\mcp.json
```

2. Add configuration (use Windows path format):
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

3. Restart Cursor AI

## Project-specific Setup

If you want to use the server only in the current project, edit the `.cursor/mcp.json` file in the project root:

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

## Verification

After setup and restarting Cursor AI, you can use the following functions (20 total):

**System Information:**
- `get_current_datetime` - Get current date and time in all formats
- `get_os_version` - Get operating system version and user information

**Mathematical Operations:**
- `calculate_math_expression` - Calculate mathematical expressions safely

**Data Generation:**
- `generate_random` - Generate UUID v4, hex strings, base64 strings, or raw bytes
- `hash_string` - Generate SHA256/SHA512 hashes
- `generate_password` - Generate secure passwords

**Encoding/Decoding:**
- `encode_base64` / `decode_base64` - Base64 encoding/decoding
- `encode_url` / `decode_url` - URL encoding/decoding

**Text Processing:**
- `format_text_case` - Convert text to different case formats
- `generate_slug` - Generate URL-friendly slugs
- `validate_data` - Validate data (email, URL, IP, etc.)
- `format_json` - Format, validate, minify, or prettify JSON

**Formatting:**
- `format_bytes` - Format bytes to human-readable format
- `format_number` - Format numbers (currency, percentage, etc.)
- `convert_color` - Convert between color formats (hex, RGB, HSL)
- `convert_timezone` - Convert datetime between timezones

**Analysis:**
- `analyze_logs` - Analyze text for errors and warnings in logs
- `analyze_language` - Analyze text for language distribution and character types

Simply request them in the Cursor AI chat, and they will be automatically available.
