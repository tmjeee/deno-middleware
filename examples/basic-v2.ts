import { SupabaseContext, withSupabase } from "@supabase/server";
import { applyMiddlewareWithSupabaseContext } from "../src/v2/middleware-with-supabase-context.ts";
import { httpMethodWithSupabaseContextMiddlewareFn } from "../src/v2/http-method-with-supabase-context-middleware.ts";
import z from "zod";
import {
  ZodValidateBodyWithSupabaseContextMiddlewareContext,
  zodValidateBodyWithSupabaseContextMiddlewareFn,
} from "../src/v2/zod-validate-body-with-supabase-context-middleware.ts";

const bodySchema = z.object({
  name: z.string(),
  age: z.number(),
});

export default {
  fetch: withSupabase(
    {
      auth: ["user"],
    },
    applyMiddlewareWithSupabaseContext({
      middlewares: [
        httpMethodWithSupabaseContextMiddlewareFn("POST"),
        zodValidateBodyWithSupabaseContextMiddlewareFn(bodySchema),
        // zodValidationProcessingWithSupabaseContextMiddlewareFn(bodySchema),
      ],
      // deno-lint-ignore require-await
      handler: async <T extends SupabaseContext<unknown>>(_req: Request, ctx: T) => {
        // ZodValidateBodyWithSupabaseContextMiddlewareContext is injected by middleware function - zodValidateBodyWithSupabaseContextMiddlewareFn(...)
        const {
          success,
          data,
          error,
        } = (ctx as unknown as ZodValidateBodyWithSupabaseContextMiddlewareContext<
          z.infer<typeof bodySchema>
        >).validation;

        if (success) { // pass validation
          const name = data?.name ?? "";
          const age = data?.age ?? 0;
          return new Response(
            JSON.stringify({ success: true, message: `Hello ${name}, you are ${age} years old` }),
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        } else {
          const msg = error?.issues.map((issue) => issue.message).join(", ") ?? `unknown error`;
          return new Response(
            JSON.stringify({ success: false, message: `error: ${msg}` }),
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
      },
    }),
  ),
};
