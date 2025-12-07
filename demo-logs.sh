#!/bin/bash
# Demo script to show how to view sys8 MCP server logs in Docker

echo "🚀 Sys8 MCP Server - Docker Logs Demo"
echo "======================================"
echo ""

# Build the image
echo "📦 Building Docker image..."
docker build -t sys8-server:latest . > /dev/null 2>&1
echo "✅ Image built successfully"
echo ""

# Run container in detached mode
echo "🐳 Starting container in detached mode..."
CONTAINER_ID=$(docker run -d --name sys8-logs-demo sys8-server:latest sleep 60)
echo "✅ Container started: $CONTAINER_ID"
echo ""

# Wait a moment
sleep 2

# Run test to generate logs
echo "🧪 Running MCP tests to generate logs..."
docker exec sys8-logs-demo node test-server.mjs > /dev/null 2>&1
echo "✅ Tests completed"
echo ""

# Show logs
echo "📋 Container logs (last 20 lines):"
echo "-----------------------------------"
docker logs --tail 20 sys8-logs-demo
echo ""

# Show how to follow logs
echo "💡 To follow logs in real-time, run:"
echo "   docker logs -f sys8-logs-demo"
echo ""

# Cleanup
echo "🧹 Cleaning up..."
docker rm -f sys8-logs-demo > /dev/null 2>&1
echo "✅ Done!"
