import { MiddlewareFn } from "./middleware.ts";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
