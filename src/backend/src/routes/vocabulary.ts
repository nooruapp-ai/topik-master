import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/** GET /api/vocabulary?level=3&theme=직장&limit=50 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { level, theme, limit } = req.query;

    let query = supabase
      .from('vocabulary')
      .select('*')
      .order('frequency', { ascending: false });

    if (typeof level === 'string' && level) query = query.eq('level', Number(level));
    if (typeof theme === 'string' && theme) query = query.eq('theme', theme);

    const take = typeof limit === 'string' ? Math.min(Number(limit) || 100, 500) : 100;
    query = query.limit(take);

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message || '어휘 목록을 불러오지 못했습니다.', 500);
    }

    res.json({ success: true, data: data ?? [] });
  })
);

export default router;
