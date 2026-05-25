import { Request, Response, NextFunction } from 'express';

/**
 * 공개 읽기 응답에 Cache-Control 을 설정합니다 (GET 에만 적용).
 * 자주 바뀌지 않는 강좌/문제/검색 결과의 재요청 비용을 줄입니다.
 */
export function publicCache(maxAgeSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAgeSeconds}`);
    }
    next();
  };
}
