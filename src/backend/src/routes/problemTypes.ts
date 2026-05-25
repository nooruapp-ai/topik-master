import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/** GET /api/problem-types?level=topik1&category=reading */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { level, category } = req.query;

    let query = supabase
      .from('problem_types')
      .select('*')
      .order('type_number', { ascending: true });

    if (typeof level === 'string' && level) query = query.eq('level', level);
    if (typeof category === 'string' && category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message || '유형 목록을 불러오지 못했습니다.', 500);
    }

    res.json({ success: true, data: data ?? [] });
  })
);

/** GET /api/problem-types/:id */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('problem_types')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message || '유형을 불러오지 못했습니다.', 500);
    }
    if (!data) {
      throw new AppError('유형을 찾을 수 없습니다.', 404);
    }

    res.json({ success: true, data });
  })
);

export default router;
