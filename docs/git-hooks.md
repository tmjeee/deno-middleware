# Git Hooks Setup

This project uses Git hooks to ensure code quality before commits.

## Installation

After cloning the repository, run the setup script:

```bash
# On Linux/Mac
./scripts/setup-hooks.sh

# On Windows (Git Bash)
sh scripts/setup-hooks.sh

# On Windows (PowerShell)
sh ./scripts/setup-hooks.sh
```

This will copy the hooks from `scripts/git-hooks/` to `.git/hooks/` and make them executable.

## Pre-commit Hook

The pre-commit hook automatically runs before each commit to validate:

1. ✅ Code formatting (`deno fmt --check`)
2. ✅ Linting (`deno lint`)
3. ✅ Type checking (`deno task check`)
4. ✅ Tests (`deno task test`)

### Usage

Just commit as normal:

```bash
git add .
git commit -m "Your commit message"
```

If any check fails, the commit will be blocked and you'll see an error message.

### Bypassing the Hook

If you need to commit without running the checks (not recommended):

```bash
git commit --no-verify -m "Your commit message"
```

### Fast Mode

If the full pre-commit hook is too slow, you can switch to the fast mode that only checks formatting:

```bash
# On Windows (PowerShell)
Copy-Item .git/hooks/pre-commit-fast .git/hooks/pre-commit

# On Linux/Mac
cp .git/hooks/pre-commit-fast .git/hooks/pre-commit
```

To switch back to the full version, run the setup script again.

## Manual Checks

You can also run these checks manually:

```bash
# Format code
deno fmt

# Check formatting without modifying files
deno fmt --check

# Lint code
deno lint

# Type check
deno task check

# Run tests
deno task test

# Run all checks
deno task fmt:check && deno task lint && deno task check && deno task test
```

## For Maintainers

### Updating Hooks

If you modify the hooks in `scripts/git-hooks/`, commit them to the repository so other developers get the updates:

```bash
# After editing scripts/git-hooks/pre-commit
git add scripts/git-hooks/
git commit -m "Update pre-commit hook"
```

Then other developers should re-run the setup script:

```bash
./scripts/setup-hooks.sh
```

## CI/CD

The same checks should be configured in your CI/CD pipeline to ensure code quality even if developers bypass the hooks.

## Why This Approach?

Git hooks in `.git/hooks/` are **not committed** to the repository (the `.git` directory is Git's internal folder). By storing hooks in `scripts/git-hooks/` (which IS committed), we can:

1. ✅ Version control the hooks
2. ✅ Share them with all developers
3. ✅ Update them centrally
4. ✅ Keep consistency across the team

Each developer just needs to run the setup script once after cloning.
