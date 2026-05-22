import { MiddlewareFn } from "./middleware.ts";
import { type ZodError, type ZodType } from "zod";

/**
 * Context shape when Zod body validation succeeds.
 *
 * @template T The validated body type inferred from the schema
 */
export interface ZodValidateBodyMiddlewareContextSuccess<T> {
  validation: {
    /** Discriminated flag indicating successful validation */
    success: true;
    /** The parsed and validated request body, fully typed */
    data: T;
  };
}

/**
 * Context shape when Zod body validation fails.
 */
export interface ZodValidateBodyMiddlewareContextFailure {
  validation: {
    /** Discriminated flag indicating failed validation */
    success: false;
    /** The ZodError containing detailed validation issues */
    error: ZodError;
    /** The original raw request body that failed validation */
    input: unknown;
  };
}

/**
 * Discriminated union representing the result of Zod body validation.
 *
 * Check `validation.success` to narrow the type safely:
 *
 * ```ts
 * const { validation } = (ctx as ZodValidateBodyMiddlewareContext<MyBody>);
 * if (validation.success) {
 *   console.log(validation.data.name);
 * } else {
 *   console.log(validation.error.issues);
 * }
 * ```
 *
 * @template T The expected body type when validation succeeds
 */
export type ZodValidateBodyMiddlewareContext<T> =
  | ZodValidateBodyMiddlewareContextSuccess<T>
  | ZodValidateBodyMiddlewareContextFailure;

/**
 * Creates a middleware that validates the JSON request body against a Zod schema
 * using `safeParse`. On success, the validated data is stored in context under
 * `validation.data`. On failure, a 400 response is returned with the validation
 * issues and the failure details are stored in context under `validation.error`.
 *
 * This is the Zod-based equivalent of {@link validateBodyMiddlewareFn}.
 *
 * @template T The TypeScript type of the validated body (usually inferred from the schema)
 * @param schema A Zod schema (e.g. `z.object({...})`)
 * @returns A middleware function compatible with `applyMiddleware`
 *
 * @example
 * ```ts
 * import { applyMiddleware, zodValidateBodyMiddlewareFn } from "@tmjeee/deno-middleware";
 * import { z } from "zod";
 *
 * const BodySchema = z.object({
 *   name: z.string().min(1),
 *   age: z.number().min(0),
 * });
 *
 * type Body = z.infer<typeof BodySchema>;
 *
 * Deno.serve(
 *   applyMiddleware({
 *     middlewares: [zodValidateBodyMiddlewareFn<Body>(BodySchema)],
 *     handler: (req, ctx) => {
 *       const { validation } = ctx as ZodValidateBodyMiddlewareContext<Body>;
 *
 *       if (validation.success) {
 *         return new Response(`Hello ${validation.data.name}`);
 *       }
 *       return new Response("Invalid", { status: 400 });
 *     },
 *   })
 * );
 * ```
 */
export const zodValidateBodyMiddlewareFn: <T>(schema: ZodType<T>) => MiddlewareFn =
  <T>(schema: ZodType<T>) => async (req, ctx, next) => {
    const body = await req.clone().json();
    const result = schema.safeParse(body);

    if (result.success) {
      (ctx as ZodValidateBodyMiddlewareContext<T>).validation = {
        success: true,
        data: result.data,
      };
      return next(req, ctx);
    }

    (ctx as ZodValidateBodyMiddlewareContext<T>).validation = {
      success: false,
      error: result.error,
      input: body,
    };

    return new Response(
      JSON.stringify({
        success: false,
        errors: result.error.issues,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      },
    );
  };
