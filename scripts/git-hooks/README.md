# Git Hooks

This directory contains Git hooks that can be shared across the team.

## Files

- `pre-commit` - Full pre-commit hook (format, lint, type check, tests)
- `pre-commit-fast` - Fast pre-commit hook (format check only)

## Installation

Run the setup script from the project root:

```bash
./scripts/setup-hooks.sh
```

This copies these hooks to `.git/hooks/` and makes them executable.

## Modification

If you modify these hooks, commit the changes so other developers can get the updates by re-running the setup script.
