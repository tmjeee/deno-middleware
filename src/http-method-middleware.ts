import { CORS_HEADERS } from "./cors-middleware.ts";
import { MiddlewareFn } from "./middleware.ts";

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
