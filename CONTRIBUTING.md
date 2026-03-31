# Contributing to Fourier Studio

Fourier Studio welcomes contributions of all kinds — bug fixes, features, documentation improvements, and test coverage. This document covers everything you need to get your work merged cleanly.

---

## Quick start for contributors

```bash
git clone https://github.com/Kareem-Taha-05/Fourier-Studio.git
cd Fourier-Studio

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -r ../requirements-dev.txt

# Frontend
cd ../frontend-app && npm install
```

Run both servers:

```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend-app && npm run dev
```

---

## How to report a bug

1. Search [open issues](https://github.com/Kareem-Taha-05/Fourier-Studio/issues) first.
2. Open a new issue using the **Bug Report** template.
3. Include your OS, Python/Node version, exact reproduction steps, and any error output from the uvicorn terminal or browser console.

---

## How to request a feature

1. Search [open issues](https://github.com/Kareem-Taha-05/Fourier-Studio/issues) first.
2. Open a new issue using the **Feature Request** template.
3. Describe the problem you are solving. A clear problem statement is more useful than a solution description.

---

## Branch naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<description>` | `feature/websocket-progress` |
| Bug fix | `fix/<description>` | `fix/double-upload-dialog` |
| Documentation | `docs/<description>` | `docs/api-reference` |
| Refactor | `refactor/<description>` | `refactor/image-registry` |

---

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): <summary>
```

Types: `feat` `fix` `docs` `style` `refactor` `test` `chore`

Examples:
```
feat(mixer): add real-time weight slider debouncing
fix(viewport): prevent double file dialog on dblclick
docs(api): document emphasizer response schema
test(mixer): add weights-affect-output assertion
```

---

## Pull request process

1. Fork and create a branch from `main`.
2. Make focused, atomic commits.
3. Verify both backend and frontend pass before opening a PR:

```bash
# From repo root
ruff check backend/          # lint
pytest tests/ -v             # tests
cd frontend-app && npm run build   # frontend build
```

4. Update `CHANGELOG.md` under `[Unreleased]`.
5. Open a PR against `main`. Fill in the PR template completely.

PRs are reviewed and merged by maintainers. Expect feedback within a few days.

---

## Code standards

### Python (backend)

- **All image math lives in service classes.** Nothing mathematical goes in API handlers.
- Sort imports with ruff (`ruff check --fix`).
- Use `X | None` instead of `Optional[X]` (Python 3.10+ union syntax).
- Type-hint all public methods.
- Maximum line length: 100 characters.

### JavaScript / React (frontend)

- Functional components with hooks only.
- All API calls go through `src/utils/api.js` — never call fetch/axios directly in a component.
- All global state goes through Zustand — never use React Context for shared state.
- Use `@/` path aliases. No `../../` relative imports.
- Styling in CSS files, logic in JSX files.

---

## Testing

```bash
# Run all tests from repo root
pytest tests/ -v

# With coverage report
pytest tests/ -v --cov=backend/app --cov-report=html
open htmlcov/index.html
```

New features should ship with tests. Bug fixes should ship with a regression test. Tests live in `tests/` and follow the naming convention `test_<module>.py`.
