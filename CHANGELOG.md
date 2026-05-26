# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [0.2.1] - 2026-05-26

#### Added

- Full **v2** support for Supabase Edge Functions using `SupabaseContext` from `@supabase/server`
  - `applyMiddlewareWithSupabaseContext`
  - `httpMethodWithSupabaseContextMiddlewareFn`
  - `zodValidateBodyWithSupabaseContextMiddlewareFn`
  - `zodValidationProcessingWithSupabaseContextMiddlewareFn`
- New Supabase utilities under `/v2`:
  - `typedRpcSingle` – Type-safe RPC call expecting a single result (or null)
  - `typedRpcMany` – Type-safe RPC call returning an array of results
- New v2 context types:
  - `ZodValidateBodyWithSupabaseContextMiddlewareContext`
  - `ZodValidationProcessingWithSupabaseContextMiddlewareContext`
- Added `examples/basic-v2.ts`
- Comprehensive test coverage for all v2 modules

#### Changed

- Restructured exports to support subpath `./v2`
- Improved documentation for v2 usage patterns
- Updated README with dedicated V2 middleware table and Utilities section

#### Internal

- Refactored several v2 modules for better type safety and consistency with `SupabaseContext`

### [0.2.0] - 2026-05-25

### [0.1.2] - 2026-05-22

- Added Zod based validation body middleware

### [0.1.1] - 2026-03-05

- Initial project structure
- Core functionality
- Unit tests
- Documentation
- CI/CD pipeline

## [0.1.0] - 2026-03-05

### Added

- Initial release
- Deno middleware functions code
- Comprehensive documentation

[Unreleased]: https://github.com/tmjeee/deno-middleware/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/tmjeee/deno-middleware/releases/tag/v0.1.0
[0.1.1]: https://github.com/tmjeee/deno-middleware/releases/tag/v0.1.1
[0.1.2]: https://github.com/tmjeee/deno-middleware/releases/tag/v0.1.2
