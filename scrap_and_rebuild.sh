#!/bin/bash

# Find the running browser container (the one with port 9221 mapped)
BROWSER_CONTAINER=$(docker ps --filter "ancestor=katokult-scraper" --format "{{.Names}}" | while read name; do
    if docker port "$name" 2>/dev/null | grep -q "9221"; then
        echo "$name"
        break
    fi
done)

if [ -z "$BROWSER_CONTAINER" ]; then
    echo "Error: No running browser container found with port 9221 exposed"
    exit 1
fi

echo "Found browser container: $BROWSER_CONTAINER"

# Get the WebSocket endpoint from the container's logs (last line)
WS_ENDPOINT=$(docker logs "$BROWSER_CONTAINER" 2>&1 | tail -1)

# Validate it looks like a WebSocket URL
if [[ ! "$WS_ENDPOINT" =~ ^ws:// ]]; then
    echo "Error: Could not extract valid WebSocket endpoint from logs"
    echo "Last log line was: $WS_ENDPOINT"
    exit 1
fi

echo "Browser WebSocket endpoint: $WS_ENDPOINT"

# Replace the internal container address with host.docker.internal for cross-container communication
# The endpoint is like: ws://0.0.0.0:9222/devtools/browser/...
# We need: ws://host.docker.internal:9221/devtools/browser/...
WS_ENDPOINT_HOST=$(echo "$WS_ENDPOINT" | sed 's/0\.0\.0\.0:9222/host.docker.internal:9221/')

docker run --rm \
    --add-host=host.docker.internal:host-gateway \
    -v ./sessions:/app/sessions \
    -v ./data:/app/data \
    -v ./backend-services:/app/backend-services \
    -v ./secrets:/app/secrets/ \
    -e BROWSER_WS_ENDPOINT="$WS_ENDPOINT_HOST" \
    katokult-scraper node ./backend-services/start-scraper.js
