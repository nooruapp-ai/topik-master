import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

/** GET /api/progress?course_id=X (내 강좌 진도) */
router.get(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { course_id } = req.query;
    if (typeof course_id !== 'string' || !course_id) {
      throw new AppError('course_id 쿼리가 필요합니다.', 400);
    }
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', req.user!.userId)
      .eq('course_id', course_id);
    if (error) {
      throw new AppError(error.message || '진도를 불러오지 못했습니다.', 500);
    }
    res.json({ success: true, data: data ?? [] });
  })
);

/** POST /api/progress  body: { course_id, lesson_id, progress_percent?, status? } */
router.post(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { course_id, lesson_id, progress_percent, status } = req.body as {
      course_id?: string;
      lesson_id?: string;
      progress_percent?: number;
      status?: string;
    };
    if (!course_id || !lesson_id) {
      throw new AppError('course_id 와 lesson_id 는 필수입니다.', 400);
    }
    const finalStatus = status ?? 'completed';
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: req.user!.userId,
          course_id,
          lesson_id,
          status: finalStatus,
          progress_percent: progress_percent ?? 100,
          completed_at: finalStatus === 'completed' ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError(error?.message ?? '진도 저장에 실패했습니다.', 500);
    }
    res.json({ success: true, data });
  })
);

export default router;
