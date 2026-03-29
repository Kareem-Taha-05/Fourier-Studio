## Summary

<!-- Describe what this PR does in 1–3 sentences. -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactor (no functional changes)

## Related Issue

Closes #<!-- issue number -->

## Changes Made

<!-- List the key changes. Be specific. -->

- 
- 

## Testing

<!-- Describe how you tested this change. -->

- [ ] Backend: `cd backend && pytest tests/ -v`
- [ ] Frontend build: `cd frontend-app && npm run build`
- [ ] Manually tested in browser (describe what you tested)

## Screenshots

<!-- If this changes the UI, add before/after screenshots. -->

## Checklist

- [ ] My code follows the project's code standards (see CONTRIBUTING.md)
- [ ] All mathematical operations are in service classes, not API handlers
- [ ] All API calls go through `src/utils/api.js`
- [ ] All global state changes go through Zustand
- [ ] I have updated `CHANGELOG.md` under `[Unreleased]`
- [ ] The docs still build: `mkdocs build`
