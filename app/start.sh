#!/bin/bash

# Photo Prompt Generator - Start Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.server.pid"

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "Server is already running (PID: $PID)"
        echo "Use ./stop.sh to stop it first"
        exit 1
    else
        # Clean up stale PID file
        rm "$PID_FILE"
    fi
fi

# Check if node_modules exists
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd "$SCRIPT_DIR" && npm install
fi

# Start the server
cd "$SCRIPT_DIR"
echo "Starting Photo Prompt Generator..."
node server.js &

# Wait a moment for the server to start
sleep 1

if [ -f "$PID_FILE" ]; then
    echo "Server started successfully!"
    echo "Open http://localhost:3000 in your browser"
else
    echo "Failed to start server"
    exit 1
fi
