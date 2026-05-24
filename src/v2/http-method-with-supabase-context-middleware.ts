import { type MiddlewareWithSupabaseContextFn } from "./middleware-with-supabase-context.ts";

/**
 * Creates a middleware (for use with `applyMiddlewareWithSupabaseContext`) that
 * only allows a specific HTTP method.
 *
 * If the incoming request uses a different method, it short-circuits with a
 * 405 Method Not Allowed JSON response.
 *
 * @param allowedMethod The only HTTP method that should be permitted ("GET" or "POST")
 * @returns A middleware function following the v2 Supabase context signature
 */
export const httpMethodWithSupabaseContextMiddlewareFn: (
  allowedMethod: "GET" | "POST",
) => MiddlewareWithSupabaseContextFn = (allowedMethod) => {
  // deno-lint-ignore require-await
  return async (req, ctx, next) => {
    const method = req.method;
    if (method !== allowedMethod) {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 405,
      });
    }
    return next(req, ctx);
  };
};
