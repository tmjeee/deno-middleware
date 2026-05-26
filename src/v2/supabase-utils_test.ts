import { assertEquals, assertRejects } from "@std/assert";
import { typedRpcMany, typedRpcSingle } from "./supabase-utils.ts";

/**
 * Tests for typedRpcSingle / typedRpcMany.
 *
 * Note:
 * - typedRpcSingle uses .maybeSingle() internally.
 *   → Returns `null` when no rows are found (instead of throwing).
 * - typedRpcMany does not use .single() or .maybeSingle().
 *   → Always returns an array (possibly empty).
 */

// A minimal fake Supabase client for testing
function createFakeClient(responses: Record<string, unknown>) {
  return {
    rpc(fn: string, _args?: unknown) {
      const result = responses[fn];
      return {
        single() {
          return {
            overrideTypes: () => ({
              data: result ?? null,
              error: null,
            }),
          };
        },
        maybeSingle() {
          return {
            overrideTypes: () => ({
              data: result ?? null,
              error: null,
            }),
          };
        },
        overrideTypes: () => ({
          data: Array.isArray(result) ? result : result ? [result] : [],
          error: null,
        }),
      };
    },
    // deno-lint-ignore no-explicit-any
  } as any;
}

Deno.test("typedRpcSingle - returns single value", async () => {
  const client = createFakeClient({
    get_user_profile: { id: "123", name: "Alice" },
  });

  const result = await typedRpcSingle(client, "get_user_profile", { user_id: "123" });

  assertEquals(result, { id: "123", name: "Alice" });
});

Deno.test("typedRpcMany - returns array of values", async () => {
  const client = createFakeClient({
    get_user_posts: [
      { id: "p1", title: "First" },
      { id: "p2", title: "Second" },
    ],
  });

  const result = await typedRpcMany(client, "get_user_posts", { user_id: "123" });

  assertEquals(result.length, 2);
  // deno-lint-ignore no-explicit-any
  assertEquals((result[0] as any).title, "First");
});

Deno.test("typedRpcSingle - returns null when no rows found (uses .maybeSingle behavior)", async () => {
  // This test verifies the key difference:
  // typedRpcSingle uses .maybeSingle(), so missing data returns null instead of throwing.
  const client = createFakeClient({
    get_user_profile: null,
  });

  const result = await typedRpcSingle(client, "get_user_profile", { user_id: "999" });

  assertEquals(result, null);
});

Deno.test("typedRpcMany - returns empty array when no data", async () => {
  const client = createFakeClient({
    get_user_posts: [],
  });

  const result = await typedRpcMany(client, "get_user_posts", { user_id: "999" });

  assertEquals(result, []);
});

Deno.test("typedRpcSingle - throws on RPC error", async () => {
  const errorClient = {
    rpc() {
      return {
        maybeSingle() {
          return {
            overrideTypes: () => ({
              data: null,
              error: new Error("RPC failed"),
            }),
          };
        },
      };
    },
    // deno-lint-ignore no-explicit-any
  } as any;

  await assertRejects(
    async () => {
      await typedRpcSingle(errorClient, "failing_rpc", {});
    },
    Error,
    "RPC failed",
  );
});
