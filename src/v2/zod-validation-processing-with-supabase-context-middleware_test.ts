import { assertEquals, assertExists } from "@std/assert";
import { applyMiddlewareWithSupabaseContext } from "./middleware-with-supabase-context.ts";
import {
  type ZodValidationProcessingWithSupabaseContextMiddlewareContext,
  zodValidationProcessingWithSupabaseContextMiddlewareFn,
} from "./zod-validation-processing-with-supabase-context-middleware.ts";
import z from "zod";

// deno-lint-ignore no-explicit-any
const fakeCtx = {} as any;
const BodySchema = z.object({ title: z.string().min(3) });

Deno.test("zodValidationProcessingWithSupabaseContextMiddlewareFn - success passes data downstream", async () => {
  const mw = zodValidationProcessingWithSupabaseContextMiddlewareFn(BodySchema);

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [mw],
    // deno-lint-ignore require-await
    handler: async (_req, ctx) => {
      const { validation } =
        ctx as unknown as ZodValidationProcessingWithSupabaseContextMiddlewareContext<
          { title: string }
        >;
      return Response.json({ received: validation.data.title });
    },
  });

  const resp = await fn(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ title: "Hello World" }),
    }),
    fakeCtx,
  );
  const body = await resp.json();

  assertEquals(body.received, "Hello World");
});

Deno.test("zodValidationProcessingWithSupabaseContextMiddlewareFn - invalid body short-circuits with 400", async () => {
  const mw = zodValidationProcessingWithSupabaseContextMiddlewareFn(BodySchema);

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [mw],
    // deno-lint-ignore require-await
    handler: async () => Response.json({ shouldNotReach: true }),
  });

  const resp = await fn(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ title: "Hi" }), // too short
    }),
    fakeCtx,
  );
  const body = await resp.json();

  assertEquals(resp.status, 400);
  assertExists(body.errors);
});
