/**
 * # Deno Middleware — v2 (Supabase Context)
 *
 * Alternative middleware system for Supabase Edge Functions that integrates directly
 * with Supabase's `SupabaseContext` (from `@supabase/server`).
 *
 * ## Installation
 *
 * ```typescript
 * import {
 *   applyMiddlewareWithSupabaseContext,
 *   httpMethodWithSupabaseContextMiddlewareFn,
 * } from "@tmjeee/deno-middleware/v2";
 * ```
 *
 * ## Key Differences from v1
 *
 * - Handler and middleware signatures receive `SupabaseContext` as a dedicated parameter
 *   (after `req`, before the user `ctx`).
 * - Designed for Supabase Edge Function environments where you need access to
 *   the authenticated Supabase client/context throughout the middleware chain.
 *
 * @module
 */

// Constants
export { CORS_HEADERS } from "./src/v2/const.ts";

// Supabase utilities
export { typedRpcMany, typedRpcSingle } from "./src/v2/supabase-utils.ts";

// Core middleware system (Supabase context variants)
export {
  applyMiddlewareWithSupabaseContext,
  type HandlerWithSupabaseContextFn,
  type MiddlewareWithSupabaseContextFn,
} from "./src/v2/middleware-with-supabase-context.ts";

// HTTP method validation (Supabase context variant)
export { httpMethodWithSupabaseContextMiddlewareFn } from "./src/v2/http-method-with-supabase-context-middleware.ts";

// Zod body validation (Supabase context variants)
export {
  type ZodValidateBodyWithSupabaseContextMiddlewareContext,
  zodValidateBodyWithSupabaseContextMiddlewareFn,
} from "./src/v2/zod-validate-body-with-supabase-context-middleware.ts";

// Zod validation processing (supabase context variants)
export {
  type ZodValidationProcessingWithSupabaseContextMiddlewareContext,
  zodValidationProcessingWithSupabaseContextMiddlewareFn,
} from "./src/v2/zod-validation-processing-with-supabase-context-middleware.ts";

// catch error (supabase context variant)
export {
  catchErrorWithSupabaseContextMiddlwareFn
} from './src/v2/catch-error-with-supabase-context-middleware.ts';
