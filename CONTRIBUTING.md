# Contributing to AuthABase

Thank you for your interest in contributing! This document outlines how to get started.

## Getting Started

1. Fork the repository and clone it locally.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the demo app to verify your changes:
   ```bash
   npm run dev
   ```

## Development Workflow

- **Branch naming**: `feat/your-feature`, `fix/your-bug`, `chore/your-task`
- **Commits**: Use clear, descriptive commit messages (e.g., `feat: add OTP fallback support`)
- **TypeScript**: Strict mode is enabled — all code must be fully typed
- **Formatting**: Run `npm run format` before committing
- **Linting**: Run `npm run lint` and resolve all errors
- **Type checking**: Run `npm run type-check` to verify types

## Making Changes

### Components

- Place new auth components in `packages/react-lib/src/components/auth/`
- Place reusable UI primitives in `packages/react-lib/src/components/ui/`
- Export new components from `packages/react-lib/src/components/index.ts`

### Tests

All new features and bug fixes must include tests.

```bash
npm test
```

Tests live in `packages/react-lib/src/tests/`. Use Vitest and React Testing Library.

### Styling

- Use Tailwind CSS utility classes
- Respect existing CSS variable conventions in `src/styles/globals.css`
- Avoid hardcoding colors — use theme tokens

## Pull Requests

1. Open a PR against the `main` branch
2. Fill out the PR description with what changed and why
3. Ensure all checks pass (lint, type-check, tests)
4. Request a review from a maintainer

## Reporting Issues

Use [GitHub Issues](../../issues) to report bugs or request features. Include:

- A clear description of the problem or request
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Environment details (OS, Node version, browser)

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
