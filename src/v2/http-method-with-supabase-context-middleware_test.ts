import { assertEquals } from "@std/assert";
import { applyMiddlewareWithSupabaseContext } from "./middleware-with-supabase-context.ts";
import { httpMethodWithSupabaseContextMiddlewareFn } from "./http-method-with-supabase-context-middleware.ts";

// deno-lint-ignore no-explicit-any
const fakeCtx = {} as any;

Deno.test("httpMethodWithSupabaseContextMiddlewareFn - allows correct method", async () => {
  const mw = httpMethodWithSupabaseContextMiddlewareFn("POST");

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [mw],
    // deno-lint-ignore require-await
    handler: async () => Response.json({ allowed: true }),
  });

  const resp = await fn(new Request("http://localhost", { method: "POST" }), fakeCtx);
  const body = await resp.json();

  assertEquals(resp.status, 200);
  assertEquals(body.allowed, true);
});

Deno.test("httpMethodWithSupabaseContextMiddlewareFn - rejects wrong method with 405", async () => {
  const mw = httpMethodWithSupabaseContextMiddlewareFn("POST");

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [mw],
    // deno-lint-ignore require-await
    handler: async () => Response.json({ shouldNotReach: true }),
  });

  const resp = await fn(new Request("http://localhost", { method: "GET" }), fakeCtx);
  const body = await resp.json();

  assertEquals(resp.status, 405);
  assertEquals(body.error, "Method not allowed");
});

Deno.test("httpMethodWithSupabaseContextMiddlewareFn - works with GET", async () => {
  const mw = httpMethodWithSupabaseContextMiddlewareFn("GET");

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [mw],
    // deno-lint-ignore require-await
    handler: async () => Response.json({ get: true }),
  });

  const resp = await fn(new Request("http://localhost", { method: "GET" }), fakeCtx);
  const body = await resp.json();

  assertEquals(body.get, true);
});
