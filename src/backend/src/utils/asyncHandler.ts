import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * async 라우트 핸들러에서 발생한 에러를 자동으로 next() 로 전달합니다.
 * 제네릭으로 Request 하위 타입(AuthRequest 등)을 받을 수 있습니다.
 */
export const asyncHandler =
  <Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
