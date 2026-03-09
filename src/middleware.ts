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
export type HandlerFn = <T extends unknown>(
  req: Request,
  ctx: T,
) => Response | Promise<Response>;

/**
 * A middleware function that can process requests, modify context, and pass control to the next middleware.
 * Middlewares can short-circuit the chain by returning a Response without calling next().
 *
 * @template T The type of the context object shared across middlewares
 * @param req The incoming HTTP request
 * @param ctx The shared context object that can be mutated
 * @param next Function to call the next middleware or handler in the chain
 * @returns A Response or Promise that resolves to a Response
 *
 * @example
 * ```ts
 * const loggingMiddleware: MiddlewareFn = (req, ctx, next) => {
 *   console.log(`${req.method} ${req.url}`);
 *   return next(req, ctx);
 * };
 * ```
 */
export type MiddlewareFn = <T extends unknown>(
  req: Request,
  ctx: T,
  next: HandlerFn,
) => Response | Promise<Response>;

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
 * import { applyMiddleware, corsMiddlewareFn, httpMethodMiddlewareFn } from "@tmjeee/deno-middleware";
 *
 * Deno.serve(applyMiddleware({
 *   middlewares: [
 *     corsMiddlewareFn(),
 *     httpMethodMiddlewareFn("POST")
 *   ],
 *   handler: (req, ctx) => {
 *     return new Response(JSON.stringify({ success: true }), {
 *       headers: { "Content-Type": "application/json" }
 *     });
 *   }
 * }));
 * ```
 */
export const applyMiddleware = <T extends unknown>(args: {
  middlewares: MiddlewareFn[];
  ctx?: T;
  handler: HandlerFn;
}): (req: Request) => Response | Promise<Response> => {
  const { middlewares, ctx, handler } = args;
  return (_req: Request) => {
    const _ctx = ctx ?? {};
    let index = 0;

    const next: HandlerFn = (req) => {
      index++;
      if (index < middlewares.length) {
        return middlewares[index](req, _ctx, next);
      }
      return handler(req, _ctx);
    };

    return middlewares[index] ? middlewares[index](_req, _ctx, next) : handler(_req, _ctx);
  };
};
