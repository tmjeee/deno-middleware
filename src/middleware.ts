export type HandlerFn = <T extends unknown>(
  req: Request,
  ctx: T,
) => Response | Promise<Response>;
export type MiddlewareFn = <T extends unknown>(
  req: Request,
  ctx: T,
  next: HandlerFn,
) => Response | Promise<Response>;

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
