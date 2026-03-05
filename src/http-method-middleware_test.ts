import { assertEquals, assertExists } from "@std/assert";
import { applyMiddleware } from "./middleware.ts";
import { httpMethodMiddlewareFn } from "./http-method-middleware.ts";
import { CORS_HEADERS } from "./cors-middleware.ts";

Deno.test("httpMethodMiddlewareFn - allows GET when configured for GET", async () => {
  const fn = applyMiddleware({
    middlewares: [httpMethodMiddlewareFn("GET")],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "GET allowed" }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "GET",
    }),
  );

  assertEquals(resp.status, 200);
  const body = await resp.json();
  assertEquals(body.message, "GET allowed");
});

Deno.test("httpMethodMiddlewareFn - blocks POST when configured for GET", async () => {
  const fn = applyMiddleware({
    middlewares: [httpMethodMiddlewareFn("GET")],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "Should not be called" }));
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    }),
  );

  assertEquals(resp.status, 405);
  assertEquals(resp.headers.get("Content-Type"), "application/json");
  assertEquals(
    resp.headers.get("Access-Control-Allow-Origin"),
    CORS_HEADERS["Access-Control-Allow-Origin"],
  );
  const body = await resp.json();
  assertEquals(body.error, "Method not allowed");
});

Deno.test("httpMethodMiddlewareFn - allows POST when configured for POST", async () => {
  const fn = applyMiddleware({
    middlewares: [httpMethodMiddlewareFn("POST")],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "POST allowed" }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(resp.status, 200);
  const body = await resp.json();
  assertEquals(body.message, "POST allowed");
});

Deno.test("httpMethodMiddlewareFn - blocks GET when configured for POST", async () => {
  const fn = applyMiddleware({
    middlewares: [httpMethodMiddlewareFn("POST")],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "Should not be called" }));
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "GET",
    }),
  );

  assertEquals(resp.status, 405);
  assertEquals(resp.headers.get("Content-Type"), "application/json");
  const body = await resp.json();
  assertEquals(body.error, "Method not allowed");
});

Deno.test("httpMethodMiddlewareFn - returns proper CORS headers on error", async () => {
  const fn = applyMiddleware({
    middlewares: [httpMethodMiddlewareFn("GET")],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "Should not be called" }));
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "DELETE",
    }),
  );

  assertEquals(resp.status, 405);
  assertExists(resp.headers.get("Access-Control-Allow-Origin"));
  assertExists(resp.headers.get("Access-Control-Allow-Headers"));
  assertEquals(resp.headers.get("Content-Type"), "application/json");
});
