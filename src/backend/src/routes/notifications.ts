import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

/** GET /api/notifications  (내 알림 목록) */
router.get(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:users!actor_id(id, username)')
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new AppError(error.message || '알림을 불러오지 못했습니다.', 500);
    res.json({ success: true, data: data ?? [] });
  })
);

/** GET /api/notifications/unread-count */
router.get(
  '/unread-count',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', req.user!.userId)
      .eq('is_read', false);
    if (error) throw new AppError(error.message || '알림 수를 불러오지 못했습니다.', 500);
    res.json({ success: true, data: { count: (data ?? []).length } });
  })
);

/** POST /api/notifications/read-all  (모두 읽음) */
router.post(
  '/read-all',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user!.userId)
      .eq('is_read', false);
    if (error) throw new AppError(error.message || '읽음 처리에 실패했습니다.', 500);
    res.json({ success: true, data: { ok: true } });
  })
);

/** POST /api/notifications/:id/read  (개별 읽음) */
router.post(
  '/:id/read',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.userId);
    if (error) throw new AppError(error.message || '읽음 처리에 실패했습니다.', 500);
    res.json({ success: true, data: { id: req.params.id } });
  })
);

export default router;
