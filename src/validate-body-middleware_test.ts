import { assertEquals, assertExists } from "@std/assert";
import { Type } from "typebox";
import { applyMiddleware } from "./middleware.ts";
import {
  ValidateBodyMiddlewareContext,
  validateBodyMiddlewareFn,
} from "./validate-body-middleware.ts";

Deno.test("validateBodyMiddlewareFn - accepts valid body", async () => {
  const schema = Type.Object({
    name: Type.String(),
    age: Type.Number(),
  });

  interface TestBody {
    name: string;
    age: number;
  }

  const fn = applyMiddleware({
    middlewares: [validateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, _ctx) => {
      const { body } = (_ctx as ValidateBodyMiddlewareContext<TestBody>).validation;
      return new Response(
        JSON.stringify({ message: "Valid", name: body.name, age: body.age }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
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

Deno.test("validateBodyMiddlewareFn - rejects invalid body with wrong type", async () => {
  const schema = Type.Object({
    name: Type.String(),
    age: Type.Number(),
  });

  interface TestBody {
    name: string;
    age: number;
  }

  const fn = applyMiddleware({
    middlewares: [validateBodyMiddlewareFn<TestBody>(schema)],
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
  assertEquals(body.result, false);
  assertExists(body.errors);
  assertEquals(Array.isArray(body.errors), true);
});

Deno.test("validateBodyMiddlewareFn - rejects body with missing required field", async () => {
  const schema = Type.Object({
    name: Type.String(),
    age: Type.Number(),
  });

  interface TestBody {
    name: string;
    age: number;
  }

  const fn = applyMiddleware({
    middlewares: [validateBodyMiddlewareFn<TestBody>(schema)],
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
  assertEquals(body.result, false);
  assertExists(body.errors);
});

Deno.test("validateBodyMiddlewareFn - accepts body with optional field", async () => {
  const schema = Type.Object({
    name: Type.String(),
    age: Type.Optional(Type.Number()),
  });

  interface TestBody {
    name: string;
    age?: number;
  }

  const fn = applyMiddleware({
    middlewares: [validateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, _ctx) => {
      const { body } = (_ctx as ValidateBodyMiddlewareContext<TestBody>).validation;
      return new Response(
        JSON.stringify({ message: "Valid", name: body.name, age: body.age }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
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

Deno.test("validateBodyMiddlewareFn - validates nested objects", async () => {
  const schema = Type.Object({
    user: Type.Object({
      name: Type.String(),
      email: Type.String(),
    }),
    metadata: Type.Object({
      timestamp: Type.Number(),
    }),
  });

  interface TestBody {
    user: {
      name: string;
      email: string;
    };
    metadata: {
      timestamp: number;
    };
  }

  const fn = applyMiddleware({
    middlewares: [validateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, _ctx) => {
      const { body } = (_ctx as ValidateBodyMiddlewareContext<TestBody>).validation;
      return new Response(
        JSON.stringify({ message: "Valid", user: body.user }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
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

Deno.test("validateBodyMiddlewareFn - context contains validation result", async () => {
  const schema = Type.Object({
    value: Type.String(),
  });

  interface TestBody {
    value: string;
  }

  let capturedContext: unknown;

  const fn = applyMiddleware({
    middlewares: [validateBodyMiddlewareFn<TestBody>(schema)],
    handler: (_req, _ctx) => {
      capturedContext = _ctx;
      const validation = (_ctx as ValidateBodyMiddlewareContext<TestBody>).validation;
      assertExists(validation);
      assertEquals(validation.result, true);
      assertEquals(validation.errors.length, 0);
      assertEquals(validation.body.value, "test");
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
