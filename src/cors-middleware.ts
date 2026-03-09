import { MiddlewareFn } from "./middleware.ts";

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

/**
 * Creates a CORS middleware that handles preflight OPTIONS requests and allows all origins.
 * Preflight requests receive an immediate "ok" response with CORS headers.
 * All other requests pass through to the next middleware or handler.
 *
 * @returns A middleware function that handles CORS
 *
 * @example
 * ```ts
 * import { applyMiddleware, corsMiddlewareFn } from "@tmjeee/deno-middleware";
 *
 * Deno.serve(applyMiddleware({
 *   middlewares: [corsMiddlewareFn()],
 *   handler: (req, ctx) => {
 *     return new Response("Hello!");
 *   }
 * }));
 * ```
 */
export const corsMiddlewareFn = () => cors;
const cors: MiddlewareFn = (req, ctx, next) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...CORS_HEADERS,
      },
    });
  }

  return next(req, ctx);
};
