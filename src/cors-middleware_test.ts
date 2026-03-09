import { assertEquals, assertExists } from "@std/assert";
import { applyMiddleware } from "./middleware.ts";
import { CORS_HEADERS, corsMiddlewareFn } from "./cors-middleware.ts";

Deno.test("corsMiddlewareFn - handles OPTIONS preflight request", async () => {
  const fn = applyMiddleware({
    middlewares: [corsMiddlewareFn()],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "This should not be called" }));
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "OPTIONS",
    }),
  );

  assertEquals(resp.status, 200);
  assertEquals(await resp.text(), "ok");
  assertEquals(
    resp.headers.get("Access-Control-Allow-Origin"),
    CORS_HEADERS["Access-Control-Allow-Origin"],
  );
  assertEquals(
    resp.headers.get("Access-Control-Allow-Headers"),
    CORS_HEADERS["Access-Control-Allow-Headers"],
  );
});

Deno.test("corsMiddlewareFn - passes through GET request", async () => {
  const fn = applyMiddleware({
    middlewares: [corsMiddlewareFn()],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "Handler called" }), {
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
  assertEquals(body.message, "Handler called");
});

Deno.test("corsMiddlewareFn - passes through POST request", async () => {
  const fn = applyMiddleware({
    middlewares: [corsMiddlewareFn()],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "POST handled" }), {
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
  assertEquals(body.message, "POST handled");
});

Deno.test("corsMiddlewareFn - CORS_HEADERS exported correctly", () => {
  assertExists(CORS_HEADERS);
  assertExists(CORS_HEADERS["Access-Control-Allow-Origin"]);
  assertExists(CORS_HEADERS["Access-Control-Allow-Headers"]);
  assertEquals(CORS_HEADERS["Access-Control-Allow-Origin"], "*");
  assertEquals(
    CORS_HEADERS["Access-Control-Allow-Headers"],
    "authorization, x-client-info, apikey, content-type",
  );
});
