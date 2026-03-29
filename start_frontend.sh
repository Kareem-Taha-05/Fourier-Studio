#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# FT Lab — Frontend Startup Script
# Usage: bash start_frontend.sh
# ─────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend-app"

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "→ Installing npm dependencies..."
  npm install
fi

echo ""
echo "✓ Starting FT Lab frontend on http://localhost:5173"
echo "  Make sure backend is running on :8000 first!"
echo "  Press Ctrl+C to stop"
echo ""

npm run dev
