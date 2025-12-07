# Multi-stage build for production
FROM node:lts AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
# Use --ignore-scripts to prevent prepare script from running before src/ is copied
RUN npm ci --ignore-scripts

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:lts-slim

# Install openssl (required for random_string method)
RUN apt-get update && apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd -r app && useradd -r -g app app

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Use --ignore-scripts because build is already done in builder stage
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Copy test file for MCP method testing
COPY test-server.mjs ./

# Set ownership
RUN chown -R app:app /app

USER app

# Start MCP server via stdio (standard for MCP servers in Docker Registry)
# Logs are handled by console.error in the application code
CMD ["node", "build/index.js"]
