/**
 * Standard CORS headers that allow all origins and common headers.
 * Used by the CORS middleware and can be included in error responses.
 *
 * @example
 * ```ts
 * import { CORS_HEADERS } from "@tmjeee/deno-middleware";
 *
 * return new Response(JSON.stringify({ error: "Not found" }), {
 *   status: 404,
 *   headers: {
 *     ...CORS_HEADERS,
 *     "Content-Type": "application/json"
 *   }
 * });
 * ```
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
