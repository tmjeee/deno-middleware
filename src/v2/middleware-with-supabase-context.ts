import { SupabaseContext } from "@supabase/server";

/**
 * A handler function that processes a request and returns a response.
 * This is the final function in the middleware chain.
 *
 * @template T The type of the context object shared across middlewares
 * @param req The incoming HTTP request
 * @param ctx The shared context object that can be mutated by middlewares
 * @returns A Response or Promise that resolves to a Response
 *
 * @example
 * ```ts
 * const handler: HandlerFn = (req, ctx) => {
 *   return new Response(JSON.stringify({ message: "Hello, World!" }), {
 *     headers: { "Content-Type": "application/json" }
 *   });
 * };
 * ```
 */
export type HandlerWithSupabaseContextFn = <T extends SupabaseContext<unknown>>(
  req: Request,
  ctx: T,
) => Promise<Response>;

/**
 * A middleware function that can process requests, modify the shared context,
 * and pass control to the next middleware or the final handler.
 *
 * Middlewares can short-circuit the chain by returning a Response directly
 * without calling `next()`.
 *
 * The `ctx` parameter in v2 is typically the Supabase context (or an extension of it).
 *
 * @template T The type of the context object (usually extends SupabaseContext)
 * @param req The incoming HTTP request
 * @param ctx The shared context object (often the Supabase context or a superset)
 * @param next Function to call the next middleware or handler in the chain
 * @returns A Response or Promise that resolves to a Response
 *
 * @example
 * ```ts
 * const loggingMiddleware: MiddlewareWithSupabaseContextFn = (req, ctx, next) => {
 *   console.log(`${req.method} ${req.url}`);
 *   return next(req, ctx);
 * };
 * ```
 */
export type MiddlewareWithSupabaseContextFn = <T extends SupabaseContext<unknown>>(
  req: Request,
  ctx: T,
  next: HandlerWithSupabaseContextFn,
) => Promise<Response>;

/**
 * Composes multiple middleware functions and a handler into a single request handler.
 * Middlewares are executed in array order, with each middleware able to pass control to the next
 * or short-circuit by returning a Response directly.
 *
 * @template T The type of the context object
 * @param args Configuration object for the middleware chain
 * @param args.middlewares Array of middleware functions to apply in order
 * @param args.ctx Optional initial context object (defaults to empty object)
 * @param args.handler The final handler function to process the request
 * @returns A function that accepts a Request and returns a Response or Promise<Response>
 *
 * @example
 * ```ts
 * import {
 *   applyMiddlewareWithSupabaseContext,
 *   httpMethodWithSupabaseContextMiddlewareFn,
 * } from "@tmjeee/deno-middleware/v2";
 * import { withSupabase } from "@supabase/server";
 *
 * export default {
 *   fetch: withSupabase(
 *    {
 *      auth: ['user],
 *      ...
 *    },
 *    applyMiddlewareWithSupabaseContext({
 *      middlewares: [
 *       httpMethodWithSupabaseContextMiddlewareFn("POST"),
 *       // ... other v2 middlewares
 *      ],
 *      // deno-lint-ignore require-await
 *      handler: async (req, ctx) => {
 *        return new Response(JSON.stringify({ success: true }), {
 *          headers: { "Content-Type": "application/json" }
 *        });
 *      }
 *    }),
 *  ),
 * }
 * ```
 */
export const applyMiddlewareWithSupabaseContext = <T extends SupabaseContext<unknown>>(args: {
  middlewares: MiddlewareWithSupabaseContextFn[];
  handler: HandlerWithSupabaseContextFn;
}): (req: Request, ctx: T) => Promise<Response> => {
  const { middlewares, handler } = args;
  return (req: Request, _ctx: T) => {
    let index = 0;

    const next: HandlerWithSupabaseContextFn = (req, ctx) => {
      index++;
      if (index < middlewares.length) {
        return middlewares[index](req, ctx, next);
      }
      return handler(req, ctx);
    };

    return middlewares[index] ? middlewares[index](req, _ctx, next) : handler(req, _ctx);
  };
};
