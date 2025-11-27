#!/bin/bash

# Photo Prompt Generator - Stop Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.server.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "Server is not running (no PID file found)"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
    echo "Stopping Photo Prompt Generator (PID: $PID)..."
    kill $PID

    # Wait for the process to stop
    for i in {1..10}; do
        if ! ps -p $PID > /dev/null 2>&1; then
            break
        fi
        sleep 0.5
    done

    # Force kill if still running
    if ps -p $PID > /dev/null 2>&1; then
        echo "Force killing server..."
        kill -9 $PID
    fi

    # Clean up PID file
    rm -f "$PID_FILE"
    echo "Server stopped successfully"
else
    echo "Server process not found (stale PID file)"
    rm -f "$PID_FILE"
fi
