import { applyMiddleware } from "../mod.ts";
import { corsMiddlewareFn } from "../src/cors-middleware.ts";
import { httpMethodMiddlewareFn } from "../src/http-method-middleware.ts";
import { Type } from "typebox";
import {
  ValidateBodyMiddlewareContext,
  validateBodyMiddlewareFn,
} from "../src/validate-body-middleware.ts";

/**
 * Basic example demonstrating the main functionality.
 *
 * Run this example:
 * ```bash
 * deno run examples/basic.ts
 * ```
 *
 * Hit the endpoint with a POST request:
 * ```bash
 *  $> curl \
 *        -X POST http://localhost:3000  \
 *        -H "Content-Type: application/json" \
 *        -d '{"name": "Alice", "age": 30}'
 * ```
 */

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
