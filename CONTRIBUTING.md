# Contributing to FREQWAVE

Thank you for your interest in contributing! This document explains how to get involved, the standards we follow, and the review process.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Report a Bug](#how-to-report-a-bug)
3. [How to Request a Feature](#how-to-request-a-feature)
4. [Development Setup](#development-setup)
5. [Branch Naming](#branch-naming)
6. [Commit Messages](#commit-messages)
7. [Pull Request Process](#pull-request-process)
8. [Code Standards](#code-standards)
9. [Testing](#testing)

---

## Code of Conduct

Be respectful, constructive, and kind. Harassment, discrimination, or abusive language of any kind will result in immediate removal from the project.

---

## How to Report a Bug

1. Search [existing issues](../../issues) first to avoid duplicates.
2. Open a new issue using the **Bug Report** template.
3. Include:
   - Your OS and Python/Node version
   - Exact steps to reproduce
   - What you expected vs what happened
   - Any error messages or screenshots

---

## How to Request a Feature

1. Search [existing issues](../../issues) first.
2. Open a new issue using the **Feature Request** template.
3. Describe the problem you are trying to solve, not just the solution you have in mind.

---

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/freqwave.git
cd freqwave

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Frontend
cd ../frontend-app
npm install
```

Run both servers:

```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend-app && npm run dev
```

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<short-description>` | `feature/websocket-progress` |
| Bug fix | `fix/<short-description>` | `fix/double-upload-dialog` |
| Docs | `docs/<short-description>` | `docs/api-reference-update` |
| Refactor | `refactor/<short-description>` | `refactor/image-registry` |
| Release | `release/<version>` | `release/1.1.0` |

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(scope): <short summary>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(mixer): add real-time weight slider debouncing
fix(viewport): prevent double file dialog on dblclick
docs(readme): add architecture diagram
test(api): add integration tests for mixer endpoint
```

---

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Make your changes with clean, focused commits.
3. Ensure both backend and frontend build without errors:
   ```bash
   cd backend && python -c "from app.main import app; print('OK')"
   cd frontend-app && npm run build
   ```
4. Run the test suite: `cd backend && pytest`
5. Update `CHANGELOG.md` under `[Unreleased]`.
6. Open a PR against `main` using the PR template.
7. Address reviewer feedback promptly.

PRs are merged by a maintainer after at least one approving review.

---

## Code Standards

### Python (backend)

- Follow [PEP 8](https://pep8.org/)
- All public functions and classes must have docstrings
- **No mathematical operations in API handlers** — all math belongs in service classes
- Use type hints throughout
- Maximum line length: 100 characters

### JavaScript / React (frontend)

- Functional components with hooks only (no class components)
- **No functionality in CSS files** — logic in JSX, styling in CSS
- All API calls go through `src/utils/api.js`
- All global state goes through Zustand (`src/store/useStore.js`)
- Use `@/` path aliases, never relative `../../` imports

---

## Testing

### Backend

```bash
cd backend
pytest tests/ -v
pytest tests/ -v --cov=app --cov-report=html
```

Tests live in `tests/`. Each API module has a corresponding test file.

### Frontend

```bash
cd frontend-app
npm run build   # Catches TypeScript/JSX errors at build time
```

Full E2E tests are a planned addition — see the roadmap.
