#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# FT Lab — Backend Startup Script
# Usage: bash start_backend.sh
# ─────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

cd "$BACKEND_DIR"

# Create and activate virtualenv if it doesn't exist
if [ ! -d ".venv" ]; then
  echo "→ Creating virtual environment..."
  python3 -m venv .venv
fi

echo "→ Activating virtualenv..."
source .venv/bin/activate

echo "→ Installing dependencies..."
pip install -r requirements.txt -q

echo ""
echo "✓ Starting FT Lab backend on http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "  Press Ctrl+C to stop"
echo ""

uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
