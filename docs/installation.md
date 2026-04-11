# Installation

## Prerequisites

| Tool | Minimum Version | Check |
|---|---|---|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

## Clone the Repository

```bash
git clone https://github.com/Kareem-Taha-05/Fourier-Studio
cd Fourier-Studio
```

## Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Optional: development dependencies

```bash
pip install -r requirements-dev.txt
```

This adds pytest, ruff, black, mkdocs, and pre-commit support.

## Frontend Setup

```bash
cd frontend-app
npm install
```

## Verify the Installation

```bash
# Backend imports correctly
cd backend && python -c "from app.main import app; print('Backend OK')"

# Frontend builds without errors
cd frontend-app && npm run build && echo "Frontend OK"
```

Both commands should exit without errors.

## Environment Variables

No environment variables are required for local development. The defaults in `backend/app/core/config.py` cover everything.

For production deployments you may want to override:

```bash
# .env (place in backend/)
CORS_ORIGINS='["https://yourdomain.com"]'
MAX_IMAGE_SIZE_MB=50
UPLOAD_DIR=/var/freqwave/uploads
```

## Next Steps

→ [Quickstart Guide](quickstart.md)
