import { MiddlewareFn } from "./middleware.ts";
import { TSchema } from "typebox";
import { TLocalizedValidationError } from "typebox/error";
import Schema from "typebox/schema";

export interface ValidateBodyMiddlewareContext<T> {
  validation: {
    result: boolean;
    errors: TLocalizedValidationError[];
    body: T;
  };
}

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
