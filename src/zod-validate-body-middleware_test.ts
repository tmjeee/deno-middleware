import { assertEquals, assertExists } from "@std/assert";
import { z } from "zod";
import { applyMiddleware } from "./middleware.ts";
import {
  ZodValidateBodyMiddlewareContext,
  zodValidateBodyMiddlewareFn,
} from "./zod-validate-body-middleware.ts";

Deno.test("zodValidateBodyMiddlewareFn - accepts valid body", async () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  type TestBody = z.infer<typeof schema>;

  const fn = applyMiddleware({
    middlewares: [zodValidateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, ctx) => {
      const { validation } = ctx as ZodValidateBodyMiddlewareContext<TestBody>;
      assertEquals(validation.success, true);
      if (validation.success) {
        return new Response(
          JSON.stringify({
            message: "Valid",
            name: validation.data.name,
            age: validation.data.age,
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response("Should not be called");
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", age: 30 }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(resp.status, 200);
  const body = await resp.json();
  assertEquals(body.message, "Valid");
  assertEquals(body.name, "Alice");
  assertEquals(body.age, 30);
});

Deno.test("zodValidateBodyMiddlewareFn - rejects invalid body with wrong type", async () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  type TestBody = z.infer<typeof schema>;

  const fn = applyMiddleware({
    middlewares: [zodValidateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "Should not be called" }));
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", age: "thirty" }), // age should be number
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(resp.status, 400);
  assertEquals(resp.headers.get("Content-Type"), "application/json");
  const body = await resp.json();
  assertEquals(body.success, false);
  assertExists(body.errors);
  assertEquals(Array.isArray(body.errors), true);
});

Deno.test("zodValidateBodyMiddlewareFn - rejects body with missing required field", async () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  type TestBody = z.infer<typeof schema>;

  const fn = applyMiddleware({
    middlewares: [zodValidateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, _ctx) => {
      return new Response(JSON.stringify({ message: "Should not be called" }));
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ name: "Alice" }), // missing age
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(resp.status, 400);
  const body = await resp.json();
  assertEquals(body.success, false);
  assertExists(body.errors);
});

Deno.test("zodValidateBodyMiddlewareFn - accepts body with optional field", async () => {
  const schema = z.object({
    name: z.string(),
    age: z.number().optional(),
  });

  type TestBody = z.infer<typeof schema>;

  const fn = applyMiddleware({
    middlewares: [zodValidateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, ctx) => {
      const { validation } = ctx as ZodValidateBodyMiddlewareContext<TestBody>;
      assertEquals(validation.success, true);
      if (validation.success) {
        return new Response(
          JSON.stringify({
            message: "Valid",
            name: validation.data.name,
            age: validation.data.age,
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response("Should not be called");
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ name: "Bob" }), // age is optional
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(resp.status, 200);
  const body = await resp.json();
  assertEquals(body.message, "Valid");
  assertEquals(body.name, "Bob");
  assertEquals(body.age, undefined);
});

Deno.test("zodValidateBodyMiddlewareFn - validates nested objects", async () => {
  const schema = z.object({
    user: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    metadata: z.object({
      timestamp: z.number(),
    }),
  });

  type TestBody = z.infer<typeof schema>;

  const fn = applyMiddleware({
    middlewares: [zodValidateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, ctx) => {
      const { validation } = ctx as ZodValidateBodyMiddlewareContext<TestBody>;
      assertEquals(validation.success, true);
      if (validation.success) {
        return new Response(
          JSON.stringify({ message: "Valid", user: validation.data.user }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response("Should not be called");
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({
        user: { name: "Charlie", email: "charlie@example.com" },
        metadata: { timestamp: 1234567890 },
      }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(resp.status, 200);
  const body = await resp.json();
  assertEquals(body.message, "Valid");
  assertEquals(body.user.name, "Charlie");
  assertEquals(body.user.email, "charlie@example.com");
});

Deno.test("zodValidateBodyMiddlewareFn - context contains validation result on success", async () => {
  const schema = z.object({
    value: z.string(),
  });

  type TestBody = z.infer<typeof schema>;

  let capturedContext: unknown;

  const fn = applyMiddleware({
    middlewares: [zodValidateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, ctx) => {
      capturedContext = ctx;
      const { validation } = ctx as ZodValidateBodyMiddlewareContext<TestBody>;
      assertEquals(validation.success, true);
      if (validation.success) {
        assertEquals(validation.data.value, "test");
      }
      return new Response(JSON.stringify({ message: "OK" }));
    },
  });

  await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ value: "test" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertExists(capturedContext);
});

Deno.test("zodValidateBodyMiddlewareFn - returns proper error response on invalid email", async () => {
  const schema = z.object({
    email: z.string().email(),
  });

  type TestBody = z.infer<typeof schema>;

  const fn = applyMiddleware({
    middlewares: [zodValidateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, _ctx) => {
      return new Response("Should not reach handler");
    },
  });

  const resp = await fn(
    new Request("http://localhost:3000/test", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  assertEquals(resp.status, 400);
  const body = await resp.json();
  assertEquals(body.success, false);
  assertExists(body.errors);
  assertEquals(Array.isArray(body.errors), true);
  // Zod email error message contains "email"
  assertEquals(body.errors[0]?.message.toLowerCase().includes("email"), true);
});
