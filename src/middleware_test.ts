import { assertEquals, assertExists } from "@std/assert";
import { applyMiddleware } from "./middleware.ts";

Deno.test("applyMiddleware", async () => {
  const stack: string[] = [];
  const fn = applyMiddleware({
    middlewares: [
      (req, ctx, next) => {
        stack.push("middleware 1");
        return next(req, ctx);
      },
      (req, ctx, next) => {
        stack.push("middleware 2");
        return next(req, ctx);
      },
    ],
    handler: (_req, _ctx) => {
      stack.push("handler 1");
      return new Response(JSON.stringify({ success: true, data: "HELLO" }), {
        headers: {
          ..._req.headers,
          "Content-Type": "application/json",
        },
      });
    },
  });

  const url = new URL("http://localhost:3000/test");
  url.searchParams.set("name", "deno");
  const resp = await fn(
    new Request(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer token",
      },
    }),
  );
  const body = await resp.json();

  assertExists(resp);
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("Content-Type"), "application/json");
  assertEquals(stack.length, 3);
  assertEquals(stack[0], "middleware 1");
  assertEquals(stack[1], "middleware 2");
  assertEquals(stack[2], "handler 1");
  assertEquals(body.success, true);
  assertExists(body.data);
  assertEquals(body.data, "HELLO");
});
