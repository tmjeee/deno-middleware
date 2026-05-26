import { CORS_HEADERS } from "./const.ts";
import { MiddlewareWithSupabaseContextFn } from "./middleware-with-supabase-context.ts";

export const catchErrorWithSupabaseContextMiddlwareFn: () => MiddlewareWithSupabaseContextFn =
  () => {
    // deno-lint-ignore require-await
    return async (req, ctx, next) => {
      try {
        return next(req, ctx);
      } catch (_err) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    };
  };
