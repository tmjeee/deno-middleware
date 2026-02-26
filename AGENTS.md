# Deno Middleware Library - Agent Instructions

This is a Deno middleware library for building composable HTTP request handlers with support for CORS, HTTP method validation, and body validation using TypeBox schemas.

## Project Overview

**Name**: `@tmjeee/deno-middleware`
**Runtime**: Deno 1.40+
**Language**: TypeScript
**Purpose**: Composable middleware system for Supabase Deno HTTP servers

## Architecture

### Core Components

1. **Middleware System** (`src/middleware.ts`)
   - `HandlerFn`: Type for final request handlers
   - `MiddlewareFn`: Type for middleware functions
   - `applyMiddleware()`: Composes middlewares into a request handler chain

2. **Built-in Middlewares**
   - `corsMiddlewareFn()`: CORS handling with preflight support
   - `httpMethodMiddlewareFn()`: HTTP method validation (GET/POST)
   - `validateBodyMiddlewareFn()`: JSON body validation using TypeBox schemas

### Key Files

```
.
├── mod.ts                          # Main export file
├── deno.json                       # Deno configuration and tasks
├── src/
│   ├── middleware.ts               # Core middleware composition logic
│   ├── cors-middleware.ts          # CORS middleware
│   ├── http-method-middleware.ts   # HTTP method validation
│   ├── validate-body-middleware.ts # Body validation with TypeBox
│   └── middleware_test.ts          # Tests for middleware system
└── examples/
    └── basic.ts                    # Complete usage example
```

## Development Guidelines

### Code Style

- **Formatting**: Uses Deno's built-in formatter (2 spaces, 100 line width, double quotes)
- **Linting**: Standard Deno recommended rules
- **Testing**: Files ending in `_test.ts` or `.test.ts`

### Dependencies

- `@std/assert`: Deno standard assertions for testing
- `typebox`: Schema validation library (imported from esm.sh)
  - `typebox/schema`: Schema compilation
  - `typebox/error`: Validation error types
  - `typebox/value`: Value utilities

### Common Tasks

```bash
deno task test          # Run all tests
deno task test:watch    # Run tests in watch mode
deno task check         # Type check the codebase
deno task fmt           # Format code
deno task fmt:check     # Check formatting
deno task lint          # Lint code
deno task coverage      # Generate test coverage
```

## Working with Middleware

### Middleware Pattern

Middlewares follow this signature:

```typescript
type MiddlewareFn = <T>(req: Request, ctx: T, next: HandlerFn) => Response | Promise<Response>;
```

- `req`: The incoming Request object
- `ctx`: Shared context object (mutable, passed through the chain)
- `next`: Function to call the next middleware or handler

### Creating New Middleware

When adding new middleware:

1. Create a new file in `src/` with `-middleware.ts` suffix
2. Export a factory function that returns a `MiddlewareFn`
3. Use the context (`ctx`) to pass data between middlewares
4. Call `next(req, ctx)` to continue the chain
5. Return early with a Response to short-circuit
6. Add tests in a corresponding `*_test.ts` file
7. Export from `mod.ts`

Example structure:

```typescript
import { MiddlewareFn } from "./middleware.ts";

export interface MyMiddlewareContext {
  myData: {/* ... */};
}

export const myMiddlewareFn: (options: Options) => MiddlewareFn =
  (options) => async (req, ctx, next) => {
    // Validate/transform request
    // Set data on context
    (ctx as MyMiddlewareContext).myData = {/* ... */};

    // Continue or short-circuit
    if (shouldContinue) {
      return next(req, ctx);
    }
    return new Response(/* error response */);
  };
```

### Context Typing

When middleware adds data to the context, define an interface and use type assertion:

```typescript
interface MyContext {
  validation: { result: boolean; body: unknown };
}

// In handler
const { body } = (ctx as MyContext).validation;
```

## TypeBox Integration

The library uses TypeBox for runtime schema validation:

```typescript
import { Type } from "typebox";

const schema = Type.Object({
  name: Type.String(),
  age: Type.Number(),
});

// Use with validation middleware
validateBodyMiddlewareFn(schema);
```

When working with validated bodies:

- Access via `(ctx as ValidateBodyMiddlewareContext<T>).validation`
- Contains: `result` (boolean), `errors` (array), `body` (typed object)

## Testing Guidelines

- Test files must be in `src/` directory or subdirectories
- Name tests with `_test.ts` or `.test.ts` suffix
- Use `@std/assert` for assertions
- Test both success and error paths
- Test middleware composition and ordering

Example test structure:

```typescript
import { assertEquals, assertExists } from "@std/assert";

Deno.test("middleware name - behavior description", async () => {
  const fn = applyMiddleware({
    middlewares: [/* ... */],
    handler: (req, ctx) => {/* ... */},
  });

  const resp = await fn(new Request("http://localhost/test"));
  assertEquals(resp.status, 200);
});
```

## Publishing Checklist

Before publishing to JSR:

1. Update `deno.json`:
   - Set correct package name (replace `@scope/package-name`)
   - Bump version number
2. Update `README.md` with accurate descriptions and examples
3. Update `mod.ts` JSDoc comments
4. Run full test suite: `deno task test`
5. Check types: `deno task check`
6. Format code: `deno task fmt`
7. Lint: `deno task lint`
8. Dry run: `deno publish --dry-run`
9. Publish: `deno publish`

## Common Patterns

### Middleware Composition Order

Middlewares execute in array order:

```typescript
applyMiddleware({
  middlewares: [
    corsMiddlewareFn(), // 1. Handle CORS preflight first
    httpMethodMiddlewareFn("POST"), // 2. Validate HTTP method
    validateBodyMiddlewareFn(schema), // 3. Validate body
    // ... more middlewares
  ],
  handler: (req, ctx) => {/* ... */}, // Last: actual handler
});
```

### Error Responses

Return JSON errors with appropriate status codes:

```typescript
return new Response(
  JSON.stringify({ error: "Error message" }),
  {
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS, // Include CORS if needed
    },
    status: 400, // or 405, 500, etc.
  },
);
```

### CORS Headers

Standard CORS headers are exported from `cors-middleware.ts`:

```typescript
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

## Known Issues / TODOs

1. ~~Package name in `deno.json` and `README.md` is still placeholder~~ - FIXED
2. ~~Filename typo: `http-method-middlware.ts` should be `http-method-middleware.ts`~~ - FIXED
3. ~~Export name typo: `httpMethodMiddlwareFn` should be `httpMethodMiddlewareFn`~~ - FIXED
4. ~~Missing exports in `mod.ts` - need to export middleware functions~~ - FIXED
5. Consider adding more HTTP methods support beyond GET/POST
6. Add support for more TypeBox validation features
7. Consider adding logging/monitoring middleware
8. Add middleware for authentication/authorization patterns
9. Add more comprehensive examples
10. TypeBox version 1.1.4 is very old - consider updating

## Important Notes

- Always clone the request before reading body: `await req.clone().json()`
- Context object is shared and mutable across all middlewares
- Middleware can short-circuit by returning Response without calling `next()`
- The handler is called last if all middlewares call `next()`
- TypeBox imports use esm.sh CDN (consider implications for offline development)
