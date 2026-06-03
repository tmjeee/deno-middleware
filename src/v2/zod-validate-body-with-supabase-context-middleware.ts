import { type MiddlewareWithSupabaseContextFn } from "./middleware-with-supabase-context.ts";
import z, { ZodType } from "zod";

/**
 * Context shape injected by `zodValidateBodyWithSupabaseContextMiddlewareFn`.
 * Attach this to your context type via declaration merging or casting.
 */
export interface ZodValidateBodyWithSupabaseContextMiddlewareContext<T> {
  validation: {
    /** Discriminated flag indicating successful validation */
    success: boolean;
    /** The parsed and validated request body, fully typed if validation succeeded */
    data?: T;
    /** The ZodError containing detailed validation issues if validation failed */
    error?: z.ZodError;
    /** The original raw request body that failed validation if validation failed */
    input?: unknown;
  };
}

/**
 * Zod body validation middleware (Supabase context version).
 *
 * Attempts to parse `req.json()` using the provided Zod schema.
 * Always continues the chain (does not short-circuit on failure).
 *
 * After running, the `ctx` will have a `validation` property that you can inspect.
 *
 * @template T The expected shape of the request body
 * @param schema A Zod schema used to validate the body
 */
export const zodValidateBodyWithSupabaseContextMiddlewareFn: <T>(
  schema: ZodType<T>,
) => MiddlewareWithSupabaseContextFn = <T>(schema: ZodType<T>) => {
  return async (req, ctx, next) => {
    const body = await req.clone().json();
    const result = schema.safeParse(body);

    if (result.success) {
      (ctx as unknown as ZodValidateBodyWithSupabaseContextMiddlewareContext<
        z.infer<typeof schema>
      >)
        .validation = {
        success: true,
        data: result.data,
      };
      return next(req, ctx);
    }

    console.log(`[ERROR] @tmjeee/deno-middleware zodValidateBodyWithSupabaseContextMiddlwareFn() `, result.error);
    (ctx as unknown as ZodValidateBodyWithSupabaseContextMiddlewareContext<z.infer<typeof schema>>)
      .validation = {
      success: false,
      error: result.error,
      input: body,
    };

    return next(req, ctx);
  };
};
