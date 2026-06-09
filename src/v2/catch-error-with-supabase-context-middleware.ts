import { CORS_HEADERS } from "./const.ts";
import { MiddlewareWithSupabaseContextFn } from "./middleware-with-supabase-context.ts";
import { isPostgrestError } from "./supabase-utils.ts";

export const catchErrorWithSupabaseContextMiddlewareFn: () => MiddlewareWithSupabaseContextFn =
  () => {
    // deno-lint-ignore require-await
    return async (req, ctx, next) => {
      try {
        return next(req, ctx);
      } catch (_err) {
        console.error(`[ERROR] @tmjeee/deno-middleware - catchErrorWithSupabaseContextMiddlewareFn `, _err);
        if (isPostgrestError(_err)) {
          return new Response(JSON.stringify({ error: _err }), {
            status: 403,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    };
  };
