import type { SupabaseContext } from "@supabase/server";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

/* ========================================================================== */
/*                              Internal Helpers                              */
/* ========================================================================== */

function extractClient(
  supabaseOrContext:
    | SupabaseClient
    | { supabase: SupabaseClient }
    | SupabaseContext<unknown>,
): SupabaseClient {
  if ("supabase" in supabaseOrContext) {
    return supabaseOrContext.supabase;
  }
  return supabaseOrContext;
}

/* ========================================================================== */
/*                               typedRpcSingle                               */
/* ========================================================================== */

/**
 * Performs a type-safe Supabase RPC call and expects **a single result or null**.
 *
 * - Returns the row directly if exactly one row is found.
 * - Returns `null` if no rows are found (does **not** throw).
 * - Throws an error if more than one row is returned.
 *
 * This is the recommended helper when your RPC function may return zero or one result.
 *
 * Internally uses `.maybeSingle()` so that missing data results in `null` instead of an error.
 *
 * @example
 * ```ts
 * // Inside a v2 middleware handler or `applyMiddlewareWithSupabaseContext`
 * const profile = await typedRpcSingle(ctx, "get_user_profile", {
 *   user_id: ctx.user?.id,
 * });
 * ```
 */
export async function typedRpcSingle<
  Args extends Record<string, unknown> = Record<string, unknown>,
  Return = unknown,
>(
  supabaseOrContext:
    | SupabaseClient
    | { supabase: SupabaseClient }
    | SupabaseContext<unknown>,
  fn: string,
  args?: Args,
): Promise<Return | null> {
  const client = extractClient(supabaseOrContext);

  const { data, error } = await client
    .rpc(fn, args ?? {})
    .maybeSingle()
    .overrideTypes<Return>();

  if (error) {
    throw error;
  }

  return data as Return | null;
}

/* ========================================================================== */
/*                                typedRpcMany                                */
/* ========================================================================== */

/**
 * Performs a type-safe Supabase RPC call and expects **an array of results**.
 *
 * Use this when your RPC function can return zero or more rows.
 *
 * @example
 * ```ts
 * // Inside a v2 middleware handler or `applyMiddlewareWithSupabaseContext`
 * const posts = await typedRpcMany(ctx, "get_user_posts", {
 *   user_id: ctx.user?.id,
 * });
 * ```
 */
export async function typedRpcMany<
  Args extends Record<string, unknown> = Record<string, unknown>,
  Return = unknown,
>(
  supabaseOrContext:
    | SupabaseClient
    | { supabase: SupabaseClient }
    | SupabaseContext<unknown>,
  fn: string,
  args?: Args,
): Promise<Return[]> {
  const client = extractClient(supabaseOrContext);

  const { data, error } = await client
    .rpc(fn, args ?? {})
    .overrideTypes<Return[]>();

  if (error) {
    throw error;
  }

  return (data as Return[]) ?? [];
}



/* ========================================================================== */
/*                                utilities                                   */
/* ========================================================================== */

export const isPostgrestError = (err: unknown): err is PostgrestError => {
  if (err instanceof PostgrestError) {
    return true;
  }
  if (!err || typeof err !== 'object') {
    return false;
  }
  // deno-lint-ignore no-explicit-any
  if ((err as any).name == 'PostgrestError') {
    return true;
  }
  return false;
}
