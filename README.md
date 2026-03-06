# Deno Middleware

[![JSR](https://jsr.io/badges/@tmjeee/deno-middleware)](https://jsr.io/@tmjeee/deno-middleware)
[![JSR Score](https://jsr.io/badges/@tmjeee/deno-middleware/score)](https://jsr.io/@tmjeee/deno-middleware)

Middleware functions / utilities for use with Supabase Deno http server.

## Features

- 🚀 Simple middleware function `applyMiddleware(...)` for `Deno.serve(...)` for Supabase Edge Functions
- 📦 Common middleware out of the box eg. (`corsMiddlewareFn()`, `httpMethodMiddlewareFn(...)` etc.)
- 🔒 Easy to add new middleware, handler functions (`MiddlewareFn` and `HandlerFn` type respectively)
- ✨ TypeScript support out of the box
- 🧪 Well tested (Hopefully !!!)
- 📚 Fully documented (Hopefully !!!)

## Installation

### Deno

```typescript
import { applyMiddleware } from "jsr:@tmjeee/deno-middleware";
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "@tmjeee/deno-middleware": "jsr:@tmjeee/deno-middleware@^0.1.0"
  }
}
```

### Node.js (via JSR npm compatibility)

For Deno server running in Supabase Edge Functions only. Doesn't make sense to run it in Node.

## Usage

### Examples

> [!NOTE]
> 📢 For a complete practical example, see [examples/basic.ts](/examples/basic.ts) which demonstrates a typical real-world usage with CORS, HTTP method validation, and body validation.

#### Simple usage

```typescript
import { applyMiddleware } from "@tmjeee/deno-middleware";

Deno.serve(
  {
    port: 3000,
    hostname: "0.0.0.0",
    onListen({ port, hostname }) {
      console.log(`Server is running on http://${hostname}:${port}`);
    },
  },
  applyMiddleware({
    middlewares: [
      // custom middleware
      (req, ctx, next) => {
        // do something with your middleware
        if (some_condition) {
          // custom response
          return new Response(...)          
        }
        // else pass it to the next middleware
        return next(req, ctx);        
      }
      // more middlewares ...
    ],
    handler: (req, ctx) => {
      return new Response(
        JSON.stringify({success: true, message: `Hello world`});
      )
    }
  }),
);
```

#### Typical usage

```typescript
import { applyMiddleware } from "@tmjeee/deno-middleware";
import { corsMiddlewareFn } from "@tmjeee/deno-middleware";
import { httpMethodMiddlewareFn } from "@tmjeee/deno-middleware";
import { Type } from "typebox";
import { ValidateBodyMiddlewareContext, validateBodyMiddlewareFn } from "@tmjeee/deno-middleware";

interface Body {
  name: string;
  age: number;
}

const BodyType = Type.Object({
  name: Type.String(),
  age: Type.Number(),
});

Deno.serve(
  {
    port: 3000,
    hostname: "0.0.0.0",
    onListen({ port, hostname }) {
      console.log(`Server is running on http://${hostname}:${port}`);
    },
  },
  applyMiddleware({
    middlewares: [
      corsMiddlewareFn(),
      httpMethodMiddlewareFn("POST"),
      validateBodyMiddlewareFn(BodyType),
    ],
    handler: (_req: Request, ctx: unknown) => {
      // `ValidateBodyMiddlewareContext` is injected by middleware function - validateBodyMiddlewareFn(...)
      const {
        body,
        errors: _errors, // validation errors
        result: _result, // true or false depending on validation success
      } = (ctx as ValidateBodyMiddlewareContext<Body>).validation;

      const name = body.name;
      const age = body.age;

      return new Response(
        JSON.stringify({ success: true, message: `Hello, ${name}! You are ${age} years old.` }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    },
  }),
);
```

### Writing a `MiddlewareFn`

A `MiddlewareFn` receives the request, a shared context object, and a `next` function to pass control to the next middleware or handler. Return a `Response` early to short-circuit the chain.

```typescript
import { MiddlewareFn } from "@tmjeee/deno-middleware";

// A simple logging middleware
const loggingMiddlewareFn: () => MiddlewareFn = () => async (req, ctx, next) => {
  const start = Date.now();
  console.log(`--> ${req.method} ${new URL(req.url).pathname}`);

  const resp = await next(req, ctx);

  console.log(`<-- ${resp.status} (${Date.now() - start}ms)`);
  return resp;
};

// A middleware that adds data to the context
interface AuthContext {
  auth: { userId: string };
}

const authMiddlewareFn: () => MiddlewareFn = () => (req, ctx, next) => {
  const token = req.headers.get("Authorization");
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Add auth info to context for downstream middlewares/handler
  (ctx as AuthContext).auth = { userId: "user-123" };
  return next(req, ctx);
};
```

### Writing a `HandlerFn`

A `HandlerFn` is the final function in the middleware chain. It receives the request and the shared context, and must return a `Response`.

```typescript
import { HandlerFn } from "@tmjeee/deno-middleware";

// Simple handler
const handler: HandlerFn = (_req, _ctx) => {
  return new Response(
    JSON.stringify({ success: true, message: "Hello, World!" }),
    { headers: { "Content-Type": "application/json" } },
  );
};

// Handler that reads from context (e.g. validated body)
interface MyContext {
  validation: { body: { name: string; age: number } };
}

const handlerWithContext: HandlerFn = (_req, ctx) => {
  const { name, age } = (ctx as MyContext).validation.body;
  return new Response(
    JSON.stringify({ success: true, greeting: `Hello ${name}, age ${age}` }),
    { headers: { "Content-Type": "application/json" } },
  );
};
```

### Built-in `MiddlewareFn`s

| Middleware                         | Description                                                         | Usage                                                            |
| ---------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `corsMiddlewareFn()`               | Handles CORS preflight requests and adds CORS headers               | `corsMiddlewareFn()`                                             |
| `httpMethodMiddlewareFn(method)`   | Validates the HTTP method (GET or POST), returns 405 if not allowed | `httpMethodMiddlewareFn("POST")`                                 |
| `validateBodyMiddlewareFn(schema)` | Validates the JSON request body against a TypeBox schema            | `validateBodyMiddlewareFn(Type.Object({ name: Type.String() }))` |

## API Documentation

Full API documentation is available on [JSR](https://jsr.io/@tmjeee/deno-middleware/doc).

## Development

### Prerequisites

- [Deno](https://deno.land/) or higher

### Commands

```bash
# Run tests
deno task test

# Run tests in watch mode
deno task test:watch

# Type check
deno task check

# Format code
deno task fmt

# Check formatting
deno task fmt:check

# Lint code
deno task lint

# Generate coverage
deno task coverage
```

## Publishing to JSR

1. Ensure you're logged in to JSR:
   ```bash
   deno publish --dry-run
   ```

2. Update the version in `deno.json`

3. Publish:
   ```bash
   deno publish
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Links

- [JSR Package](https://jsr.io/@tmjeee/deno-middleware)
- [Documentation](https://jsr.io/@tmjeee/deno-middleware/doc)
- [Source Code](https://github.com/tmjeee/deno-middleware)
- [Issues](https://github.com/tmjeee/deno-middleware/issues)
