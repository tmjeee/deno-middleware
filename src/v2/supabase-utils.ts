import type { SupabaseContext } from "@supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Performs a type-safe Supabase RPC call using `.overrideTypes()`.
 *
 * This helper accepts either a raw `SupabaseClient` or a Supabase context object
 * (such as the one provided by `@supabase/server`'s `withSupabase` or inside v2 middleware handlers).
 *
 * @example
 * ```ts
 * // Inside a v2 middleware handler or `applyMiddlewareWithSupabaseContext`
 * const profile = await typedRpc(
 *   ctx,
 *   "get_user_profile",
 *   { user_id: ctx.user?.id }
 * );
 * ```
 */
export async function typedRpc<
  Args extends Record<string, unknown> = Record<string, unknown>,
  Return = unknown,
>(
  supabaseOrContext:
    | SupabaseClient
    | { supabase: SupabaseClient }
    | SupabaseContext<unknown>,
  fn: string,
  args?: Args,
): Promise<Return> {
  // Extract the actual Supabase client from either the client itself or a context object
  const client: SupabaseClient = "supabase" in supabaseOrContext
    ? supabaseOrContext.supabase
    : supabaseOrContext;

  const { data, error } = await client
    .rpc(fn, args ?? {})
    .overrideTypes<Return>();

  if (error) {
    throw error;
  }

  return data as Return;
}
