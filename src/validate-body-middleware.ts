import { MiddlewareFn } from "./middleware.ts";
import { TSchema } from "typebox";
import { TLocalizedValidationError } from "typebox/error";
import Schema from "typebox/schema";

/**
 * Context type that is added by the validate body middleware.
 * Contains validation results including the parsed body, validation status, and any errors.
 *
 * @template T The type of the validated body object
 *
 * @example
 * ```ts
 * import { ValidateBodyMiddlewareContext } from "@tmjeee/deno-middleware";
 *
 * interface MyBody {
 *   name: string;
 *   age: number;
 * }
 *
 * const handler = (req, ctx) => {
 *   const { body, errors, result } = (ctx as ValidateBodyMiddlewareContext<MyBody>).validation;
 *   console.log(body.name, body.age);
 *   return new Response("OK");
 * };
 * ```
 */
export interface ValidateBodyMiddlewareContext<T> {
  /**
   * Validation result object containing the parsed body, validation status, and errors.
   */
  validation: {
    /** Whether the validation passed (true) or failed (false) */
    result: boolean;
    /** Array of validation errors (empty if validation passed) */
    errors: TLocalizedValidationError[];
    /** The parsed and validated request body */
    body: T;
  };
}

/**
 * Creates a middleware that validates the JSON request body against a TypeBox schema.
 * If validation fails, returns a 400 Bad Request response with error details.
 * If validation succeeds, adds the validated body to the context under `validation.body`.
 *
 * @template T The type of the expected body object
 * @param schema A TypeBox schema that defines the expected structure of the request body
 * @returns A middleware function that validates the request body
 *
 * @example
 * ```ts
 * import { applyMiddleware, validateBodyMiddlewareFn, ValidateBodyMiddlewareContext } from "@tmjeee/deno-middleware";
 * import { Type } from "typebox";
 *
 * interface RequestBody {
 *   name: string;
 *   age: number;
 * }
 *
 * const schema = Type.Object({
 *   name: Type.String(),
 *   age: Type.Number()
 * });
 *
 * Deno.serve(applyMiddleware({
 *   middlewares: [validateBodyMiddlewareFn<RequestBody>(schema)],
 *   handler: (req, ctx) => {
 *     const { body } = (ctx as ValidateBodyMiddlewareContext<RequestBody>).validation;
 *     return new Response(`Hello ${body.name}, age ${body.age}`);
 *   }
 * }));
 * ```
 */
export const validateBodyMiddlewareFn: <T>(schema: TSchema) => MiddlewareFn =
  <T>(schema: TSchema) => async (_req, _ctx, next) => {
    const body = await _req.clone().json();

    const validator = Schema.Compile(schema);
    const [result, errors] = validator.Errors(body);
    (_ctx as ValidateBodyMiddlewareContext<T>).validation = {
      result: true,
      errors: errors ?? [],
      body: body as T,
    };
    if (!result) {
      return new Response(
        JSON.stringify({ result, errors: errors ?? [] }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        },
      );
    }
    return next(_req, _ctx);
  };
