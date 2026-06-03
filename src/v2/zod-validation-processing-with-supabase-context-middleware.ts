import z, { ZodType } from "zod";
import { type MiddlewareWithSupabaseContextFn } from "./middleware-with-supabase-context.ts";
import { CORS_HEADERS } from "./const.ts";

/**
 * Context shape attached by `zodValidationProcessingWithSupabaseContextMiddlewareFn`.
 *
 * On success, `validation.data` contains the parsed body.
 * On failure, the middleware short-circuits with a 400 response.
 */
export interface ZodValidationProcessingWithSupabaseContextMiddlewareContext<D> {
  validation: {
    data: D;
  };
}

/**
 * Zod validation middleware that **short-circuits on failure**.
 *
 * - Success → attaches `{ validation: { data } }` to ctx and continues.
 * - Failure → immediately returns a 400 JSON error response (no further middlewares run).
 *
 * This is useful when you want to reject invalid requests early with a consistent error format.
 *
 * @template T Expected body shape
 * @param schema Zod schema to validate against
 */
export const zodValidationProcessingWithSupabaseContextMiddlewareFn: <T>(
  schema: ZodType<T>,
) => MiddlewareWithSupabaseContextFn = <T>(schema: ZodType<T>) => {
  return async (req, ctx, next) => {
    const body = await req.clone().json();
    const result = schema.safeParse(body);

    if (result.success) {
      (ctx as unknown as ZodValidationProcessingWithSupabaseContextMiddlewareContext<
        z.infer<typeof schema>
      >)
        .validation = {
        data: result.data,
      };
      return next(req, ctx);
    }

    console.log(`[ERROR] @tmjeee/deno-middeware zodValidationProcessingWithSupabaseContextMiddlwareFn() `, result.error);
    return new Response(
      JSON.stringify({
        errors: result.error.issues.map((i) => i.message).join(", "),
      }),
      {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        status: 400,
      },
    );
  };
};
