import { assertEquals } from "@std/assert";
import {
  applyMiddlewareWithSupabaseContext,
  type HandlerWithSupabaseContextFn,
  type MiddlewareWithSupabaseContextFn,
} from "./middleware-with-supabase-context.ts";

// A minimal fake SupabaseContext-like object for testing purposes
const createFakeSupabaseContext = (overrides: Record<string, unknown> = {}) =>
  ({
    user: { id: "user-123", email: "test@example.com" },
    ...overrides,
    // deno-lint-ignore no-explicit-any
  }) as any;

Deno.test("applyMiddlewareWithSupabaseContext - basic middleware + handler execution order", async () => {
  const stack: string[] = [];

  const middleware1: MiddlewareWithSupabaseContextFn = (req, ctx, next) => {
    stack.push("mw1");
    return next(req, ctx);
  };

  const middleware2: MiddlewareWithSupabaseContextFn = (req, ctx, next) => {
    stack.push("mw2");
    return next(req, ctx);
  };

  // deno-lint-ignore require-await
  const handler: HandlerWithSupabaseContextFn = async (_req, _ctx) => {
    stack.push("handler");
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  };

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [middleware1, middleware2],
    handler,
  });

  const ctx = createFakeSupabaseContext();
  const resp = await fn(new Request("http://localhost/test"), ctx);
  const body = await resp.json();

  assertEquals(stack, ["mw1", "mw2", "handler"]);
  assertEquals(resp.status, 200);
  assertEquals(body.ok, true);
});

Deno.test("applyMiddlewareWithSupabaseContext - middleware can short-circuit", async () => {
  const stack: string[] = [];

  // deno-lint-ignore require-await
  const authMiddleware: MiddlewareWithSupabaseContextFn = async (_req, _ctx, _next) => {
    stack.push("auth-mw");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  };

  // deno-lint-ignore require-await
  const neverCalled: MiddlewareWithSupabaseContextFn = async (_req, _ctx, _next) => {
    stack.push("should-not-run");
    return new Response("no");
  };

  // deno-lint-ignore require-await
  const handler: HandlerWithSupabaseContextFn = async () => {
    stack.push("handler");
    return new Response("should not reach");
  };

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [authMiddleware, neverCalled],
    handler,
  });

  const ctx = createFakeSupabaseContext();
  const resp = await fn(new Request("http://localhost/secret"), ctx);
  const body = await resp.json();

  assertEquals(stack, ["auth-mw"]);
  assertEquals(resp.status, 401);
  assertEquals(body.error, "Unauthorized");
});

Deno.test("applyMiddlewareWithSupabaseContext - context mutation is visible downstream", async () => {
  interface MyCtx {
    userId?: string;
    validated?: boolean;
  }

  const enrichMiddleware: MiddlewareWithSupabaseContextFn = (req, ctx, next) => {
    (ctx as MyCtx).userId = "abc-123";
    return next(req, ctx);
  };

  // deno-lint-ignore require-await
  const handler: HandlerWithSupabaseContextFn = async (_req, ctx) => {
    const userId = (ctx as unknown as MyCtx).userId;
    return Response.json({ userId });
  };

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [enrichMiddleware],
    handler,
  });

  const ctx = createFakeSupabaseContext();
  const resp = await fn(new Request("http://localhost/me"), ctx);
  const body = await resp.json();

  assertEquals(body.userId, "abc-123");
});

Deno.test("applyMiddlewareWithSupabaseContext - no middlewares still calls handler", async () => {
  // deno-lint-ignore require-await
  const handler: HandlerWithSupabaseContextFn = async () => Response.json({ direct: true });

  const fn = applyMiddlewareWithSupabaseContext({
    middlewares: [],
    handler,
  });

  const ctx = createFakeSupabaseContext();
  const resp = await fn(new Request("http://localhost/direct"), ctx);
  const body = await resp.json();

  assertEquals(body.direct, true);
});
