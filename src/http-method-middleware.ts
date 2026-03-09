import { CORS_HEADERS } from "./cors-middleware.ts";
import { MiddlewareFn } from "./middleware.ts";

/**
 * Creates a middleware that validates the HTTP method of incoming requests.
 * Returns a 405 Method Not Allowed response if the request method doesn't match the allowed method.
 *
 * @param allowedMethod The HTTP method to allow ("GET" or "POST")
 * @returns A middleware function that validates the HTTP method
 *
 * @example
 * ```ts
 * import { applyMiddleware, httpMethodMiddlewareFn } from "@tmjeee/deno-middleware";
 *
 * // Only allow POST requests
 * Deno.serve(applyMiddleware({
 *   middlewares: [httpMethodMiddlewareFn("POST")],
 *   handler: (req, ctx) => {
 *     return new Response("POST request handled");
 *   }
 * }));
 * ```
 */
export const httpMethodMiddlewareFn: (allowedMethod: "GET" | "POST") => MiddlewareFn =
  (allowedMethod = "GET") => (req, ctx, next) => {
    const method = req.method;
    if (allowedMethod !== method) {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
        status: 405,
      });
    }
    return next(req, ctx);
  };
