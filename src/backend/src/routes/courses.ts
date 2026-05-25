import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/** GET /api/courses?level=3 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let query = supabase.from('courses').select('*').order('created_at', { ascending: true });

    const { level } = req.query;
    if (typeof level === 'string' && level) {
      query = query.eq('level', Number(level));
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message || '강좌 목록을 불러오지 못했습니다.', 500);
    }

    res.json({ success: true, data: data ?? [] });
  })
);

/** GET /api/courses/:id (레슨 포함) */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message || '강좌를 불러오지 못했습니다.', 500);
    }
    if (!course) {
      throw new AppError('강좌를 찾을 수 없습니다.', 404);
    }

    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', req.params.id)
      .order('order_index', { ascending: true });

    res.json({ success: true, data: { ...course, lessons: lessons ?? [] } });
  })
);

export default router;
