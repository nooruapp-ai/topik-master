import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';

/**
 * Authorization: Bearer <token> 헤더를 검증하고 req.user 를 채웁니다.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('인증 토큰이 필요합니다.', 401);
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    req.user = verifyToken(token);
  } catch {
    throw new AppError('유효하지 않거나 만료된 토큰입니다.', 401);
  }

  next();
}
