# sys8 MCP Server - Installation Guide

Complete installation and configuration guide for sys8 MCP Server across all MCP-compatible clients.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Cursor AI](#cursor-ai)
  - [Claude Desktop](#claude-desktop)
  - [Windsurf](#windsurf)
  - [Standalone/CLI](#standalonecli)
  - [Docker](#docker)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js >= 24.0.0** (required)
  - Used for: All server functionality, UUID generation (via `crypto` module), date/time operations
- **npm** or compatible package manager (required)
  - Used for: Installing dependencies and building the project
- **openssl** (required for `generate_random` with hex/base64/bytes types)
  - Usually pre-installed on macOS and Linux
  - Windows: Install via [OpenSSL for Windows](https://slproweb.com/products/Win32OpenSSL.html) or use WSL
  - **Note**: UUID generation via `generate_random` with `type: 'uuid'` does NOT require openssl (uses Node.js `crypto.randomUUID()`)

### NPM Dependencies

The following packages are automatically installed via `npm install`:

- **@modelcontextprotocol/sdk** (v1.23.1)
  - Required for: MCP protocol implementation, server/client communication
- **expr-eval** (v2.0.2)
  - Required for: Safe mathematical expression evaluation in `calculate_math_expression`
  - Provides: Secure expression parsing without `eval()` security risks

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Angry-Robot-Deals/mcp-sys8.git
cd sys8
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Server

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Create the `build/index.js` file
- Set executable permissions on the built file

### Step 4: Verify Installation

```bash
npm test
```

This runs the test suite to verify all 20 tools are working correctly.

---

## Configuration

### Cursor AI

#### Global Configuration (All Users and Projects) - Recommended

**macOS/Linux:**
```bash
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage
nano ~/Library/Application\ Support/Cursor/User/globalStorage/mcp.json
```

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\mcp.json
```

**Linux (alternative):**
```bash
mkdir -p ~/.config/Cursor/User/globalStorage
nano ~/.config/Cursor/User/globalStorage/mcp.json
```

**Configuration:**
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

**For Development (using tsx):**
```json
{
  "mcpServers": {
    "sys8": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/sys8/src/index.ts"]
    }
  }
}
```

**Restart Cursor AI** after configuration.

#### Project-Specific Configuration

Create `.cursor/mcp.json` in your project root:

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

**Note:** Replace `/absolute/path/to/sys8/build/index.js` with the actual path to your built server file.

---

### Claude Desktop

#### macOS

1. Open the configuration file:
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. Add sys8 to the `mcpServers` section:
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

3. Restart Claude Desktop.

#### Windows

1. Open the configuration file:
```
%APPDATA%\Claude\claude_desktop_config.json
```

2. Add sys8 configuration (use Windows path format):
```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["C:\\path\\to\\sys8\\build\\index.js"]
    }
  }
}
```

3. Restart Claude Desktop.

#### Linux

1. Open the configuration file:
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

2. Add sys8 configuration:
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

3. Restart Claude Desktop.

---

### Windsurf

#### Configuration

1. Open Windsurf settings
2. Navigate to MCP Servers configuration
3. Add sys8 server:

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

4. Restart Windsurf.

**Note:** Windsurf may use a different configuration file location. Check Windsurf documentation for the exact path.

---

### Standalone/CLI

#### Running as Standalone Server

You can run sys8 as a standalone MCP server:

```bash
# Using compiled JavaScript
node /path/to/sys8/build/index.js

# Using TypeScript directly (requires tsx)
npx tsx /path/to/sys8/src/index.ts
```

#### Programmatic Usage

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'my-client',
  version: '1.0.0',
}, {
  capabilities: {},
});

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/sys8/build/index.js'],
});

await client.connect(transport);

// Use tools
const result = await client.callTool({
  name: 'get_current_datetime',
  arguments: {},
});

console.log(JSON.parse(result.content[0].text));

await client.close();
```

#### Using npm link (Development)

For development, you can use npm link:

```bash
cd sys8
npm link
```

Then in your configuration:
```json
{
  "mcpServers": {
    "sys8": {
      "command": "sys8"
    }
  }
}
```

---

### Docker

#### Building the Docker Image

```bash
cd sys8
docker build -t sys8:latest .
```

#### Running the Container

The sys8 MCP server uses stdio protocol for communication:

```bash
# Run interactively
docker run --rm -i sys8:latest

# Run in detached mode
docker run -d --name sys8-server sys8:latest

# View logs
docker logs sys8-server
docker logs -f sys8-server  # Follow mode
```

#### Using with Docker Desktop MCP Toolkit

After building the image, configure it in Docker Desktop's MCP settings. The server will be available through Docker Desktop MCP Toolkit.

#### Docker Configuration Example

```json
{
  "mcpServers": {
    "sys8": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "sys8:latest"]
    }
  }
}
```

---

## Verification

### Test the Installation

Run the test suite:

```bash
cd sys8
npm test
```

This will test all 20 tools and verify they're working correctly.

### Verify Tools are Available

After configuring your MCP client, you should see all 20 tools available:

1. **System Information:**
   - `get_current_datetime` - Get current date and time in all formats
   - `get_os_version` - Get operating system version and user information

2. **Mathematical Operations:**
   - `calculate_math_expression` - Calculate mathematical expressions safely

3. **Data Generation:**
   - `generate_random` - Generate UUID v4, hex strings, base64 strings, or raw bytes
   - `hash_string` - Generate SHA256/SHA512 hashes
   - `generate_password` - Generate secure passwords

4. **Encoding/Decoding:**
   - `encode_base64` / `decode_base64` - Base64 encoding/decoding
   - `encode_url` / `decode_url` - URL encoding/decoding

5. **Text Processing:**
   - `format_text_case` - Convert text to different case formats
   - `generate_slug` - Generate URL-friendly slugs
   - `validate_data` - Validate data (email, URL, IP, etc.)
   - `format_json` - Format, validate, minify, or prettify JSON

6. **Formatting:**
   - `format_bytes` - Format bytes to human-readable format
   - `format_number` - Format numbers (currency, percentage, etc.)
   - `convert_color` - Convert between color formats (hex, RGB, HSL)
   - `convert_timezone` - Convert datetime between timezones

7. **Analysis:**
   - `analyze_logs` - Analyze text for errors and warnings in logs
   - `analyze_language` - Analyze text for language distribution and character types

### Quick Test

Try asking your MCP client:
- "What's the current date and time?"
- "Generate a UUID for me"
- "Calculate 2 + 2 * 3"
- "Hash the string 'test'"

---

## Troubleshooting

### Common Issues

#### 1. "Command not found: node"

**Solution:** Ensure Node.js >= 24.0.0 is installed and in your PATH:
```bash
node --version  # Should show v24.0.0 or higher
which node      # Should show path to node executable
```

#### 2. "Cannot find module '@modelcontextprotocol/sdk'"

**Solution:** Run `npm install` in the sys8 directory:
```bash
cd sys8
npm install
```

#### 3. "build/index.js not found"

**Solution:** Build the server:
```bash
cd sys8
npm run build
```

#### 4. "openssl: command not found" (for hex/base64/bytes generation)

**Solution:** 
- **macOS/Linux:** openssl is usually pre-installed. If not, install via package manager.
- **Windows:** Install [OpenSSL for Windows](https://slproweb.com/products/Win32OpenSSL.html) or use WSL.

**Note:** UUID generation works without openssl.

#### 5. Server not appearing in MCP client

**Solution:**
1. Verify the configuration file path is correct
2. Check that the path to `build/index.js` is absolute and correct
3. Restart the MCP client
4. Check client logs for error messages

#### 6. Permission denied errors

**Solution:** Ensure the built file has executable permissions:
```bash
chmod +x sys8/build/index.js
```

Or rebuild:
```bash
cd sys8
npm run build
```

### Getting Help

- **Repository:** https://github.com/Angry-Robot-Deals/mcp-sys8
- **Issues:** https://github.com/Angry-Robot-Deals/mcp-sys8/issues
- **Documentation:** See README.md in repository

---

## Next Steps

After installation and configuration:

1. **Test the tools** using your MCP client
2. **Read the documentation** in README.md for detailed tool usage
3. **Explore examples** in the test suite (`test-server.mjs`)
4. **Check logs** if you encounter any issues

Enjoy using sys8 MCP Server! 🚀
