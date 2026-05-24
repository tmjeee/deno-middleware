import { assertEquals } from "@std/assert";
import { applyMiddlewareWithSupabaseContext } from "./middleware-with-supabase-context.ts";
import {
  type ZodValidateBodyWithSupabaseContextMiddlewareContext,
  zodValidateBodyWithSupabaseContextMiddlewareFn,
} from "./zod-validate-body-with-supabase-context-middleware.ts";
import z from "zod";

// deno-lint-ignore no-explicit-any
const fakeCtx = {} as any;
const BodySchema = z.object({ name: z.string(), age: z.number() });
type Body = z.infer<typeof BodySchema>;

Deno.test("zodValidateBodyWithSupabaseContextMiddlewareFn - success path attaches validation", async () => {
  const mw = zodValidateBodyWithSupabaseContextMiddlewareFn<Body>(BodySchema);

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [mw],
    // deno-lint-ignore require-await
    handler: async (_req, ctx) => {
      const { validation } = ctx as unknown as ZodValidateBodyWithSupabaseContextMiddlewareContext<
        Body
      >;
      return Response.json({ success: validation.success, name: validation.data?.name });
    },
  });

  const resp = await fn(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", age: 30 }),
    }),
    fakeCtx,
  );
  const body = await resp.json();

  assertEquals(body.success, true);
  assertEquals(body.name, "Alice");
});

Deno.test("zodValidateBodyWithSupabaseContextMiddlewareFn - failure still continues chain", async () => {
  const mw = zodValidateBodyWithSupabaseContextMiddlewareFn<Body>(BodySchema);

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [mw],
    // deno-lint-ignore require-await
    handler: async (_req, ctx) => {
      const { validation } = ctx as unknown as ZodValidateBodyWithSupabaseContextMiddlewareContext<
        Body
      >;
      return Response.json({ success: validation.success, error: !!validation.error });
    },
  });

  const resp = await fn(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Bob" }), // missing age
    }),
    fakeCtx,
  );
  const body = await resp.json();

  assertEquals(body.success, false);
  assertEquals(body.error, true);
});
