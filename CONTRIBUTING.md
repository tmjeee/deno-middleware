# Contributing Guide

Thank you for your interest in contributing to this project! This guide will help you get started.

## Development Setup

1. **Install Deno**
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/tmjeee/deno-middleware.git
   cd deno-middleware
   ```

3. **Run tests**
   ```bash
   deno task test
   ```

## Project Structure

```
.
├── src/              # Source code
│   ├── middleware.ts                        # Deno middleware functions (main file)
│   ├── http-method-middleware.ts            # middleware to restrict access to certain http methods (GET, POST etc.)
│   ├── cors-middleware.ts                   # middleware to return response allowing CORS access (when method is OPTIONS)
│   ├── validate-body-middleware.ts          # middleware that accepts TypeBox type for body validation
│   └── *_test.ts                            # Test files
├── examples/                                # Usage examples
├── mod.ts                                   # Main entry point
├── deno.json                                # Deno configuration
├── AGENTS.md                                # AGENTS mark down file
└── README.md                                # Documentation
```

## Development Workflow

### Before Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make sure all tests pass:
   ```bash
   deno task test
   ```

### Making Changes

1. **Write code** following the existing patterns
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Run checks**:
   ```bash
   deno task fmt        # Format code
   deno task lint       # Lint code
   deno task check      # Type check
   deno task test       # Run tests
   ```

### Code Style

- Use TypeScript for all code
- Follow the existing code style (enforced by `deno fmt`)
- Add JSDoc comments for all exported functions
- Include examples in JSDoc comments

### Testing

- Write tests for all new functionality
- Tests should be in `*_test.ts` files
- Aim for high test coverage
- Use descriptive test names

Example:

```typescript
Deno.test("functionName - descriptive test case", () => {
  // Arrange
  const input = "test";

  // Act
  const result = yourFunction(input);

  // Assert
  assertEquals(result.success, true);
});
```

### Documentation

- Update README.md for new features
- Add JSDoc comments with examples
- Update CHANGELOG.md
- Add examples to the `examples/` directory if appropriate

### Committing Changes

1. **Stage your changes**:
   ```bash
   git add .
   ```

2. **Commit with a descriptive message**:
   ```bash
   git commit -m "feat: add new feature"
   ```

   Use conventional commit messages:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions or changes
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** on GitHub

## Pull Request Guidelines

- Fill out the PR template completely
- Link related issues
- Ensure CI passes
- Request review from maintainers
- Be responsive to feedback

## Reporting Issues

When reporting issues, please include:

- Deno version (`deno --version`)
- Operating system
- Minimal reproduction example
- Expected vs actual behavior
- Error messages and stack traces

## Questions?

Feel free to open an issue for any questions or concerns!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
