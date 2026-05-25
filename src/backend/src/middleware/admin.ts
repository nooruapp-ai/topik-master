import { AuthRequest } from '../types';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from './errorHandler';

/**
 * 관리자 권한을 확인합니다. authenticate 다음에 사용하세요.
 * 통과 시 req.adminRole 에 역할(admin/super_admin)을 채웁니다.
 */
export const requireAdmin = asyncHandler<AuthRequest>(async (req, _res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('인증이 필요합니다.', 401);
  }

  const { data, error } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message || '관리자 확인에 실패했습니다.', 500);
  }
  if (!data) {
    throw new AppError('관리자 권한이 필요합니다.', 403);
  }

  req.adminRole = data.role as string;
  next();
});
