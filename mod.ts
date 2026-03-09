/**
 * # Deno Middleware
 *
 * Composable middleware system for Deno HTTP servers, designed for Supabase Edge Functions.
 *
 * ## Installation
 *
 * ```typescript
 * import { applyMiddleware } from "jsr:@tmjeee/deno-middleware";
 * ```
 *
 * Or add to your `deno.json`:
 *
 * ```json
 * {
 *   "imports": {
 *     "@tmjeee/deno-middleware": "jsr:@tmjeee/deno-middleware@^0.1.0"
 *   }
 * }
 * ```
 *
 * ## Usage
 *
 * ### Basic Example
 *
 * ```typescript
 * import { applyMiddleware, corsMiddlewareFn, httpMethodMiddlewareFn } from "@tmjeee/deno-middleware";
 *
 * Deno.serve(
 *   applyMiddleware({
 *     middlewares: [
 *       corsMiddlewareFn(),
 *       httpMethodMiddlewareFn("POST"),
 *     ],
 *     handler: (req, ctx) => {
 *       return new Response(JSON.stringify({ message: "Hello World" }), {
 *         headers: { "Content-Type": "application/json" }
 *       });
 *     }
 *   })
 * );
 * ```
 *
 * ### With Body Validation
 *
 * ```typescript
 * import {
 *   applyMiddleware,
 *   validateBodyMiddlewareFn,
 *   ValidateBodyMiddlewareContext
 * } from "@tmjeee/deno-middleware";
 * import { Type } from "typebox";
 *
 * const schema = Type.Object({
 *   name: Type.String(),
 *   age: Type.Number()
 * });
 *
 * Deno.serve(
 *   applyMiddleware({
 *     middlewares: [validateBodyMiddlewareFn(schema)],
 *     handler: (req, ctx) => {
 *       const { body } = (ctx as ValidateBodyMiddlewareContext<{ name: string; age: number }>).validation;
 *       return new Response(JSON.stringify({ greeting: `Hello ${body.name}` }));
 *     }
 *   })
 * );
 * ```
 *
 * @module
 */

// Core middleware system
export * from "./src/middleware.ts";
export type { HandlerFn, MiddlewareFn } from "./src/middleware.ts";

// CORS middleware
export { CORS_HEADERS, corsMiddlewareFn } from "./src/cors-middleware.ts";

// HTTP method validation middleware
export { httpMethodMiddlewareFn } from "./src/http-method-middleware.ts";

// Body validation middleware
export {
  type ValidateBodyMiddlewareContext,
  validateBodyMiddlewareFn,
} from "./src/validate-body-middleware.ts";
