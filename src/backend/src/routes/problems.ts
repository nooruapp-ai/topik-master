import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/** GET /api/problems?category=reading&level=3&limit=20 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, level, lesson_id, type_id, limit } = req.query;

    let query = supabase.from('problems').select('*').order('created_at', { ascending: true });

    if (typeof category === 'string' && category) query = query.eq('category', category);
    if (typeof level === 'string' && level) query = query.eq('level', Number(level));
    if (typeof lesson_id === 'string' && lesson_id) query = query.eq('lesson_id', lesson_id);
    if (typeof type_id === 'string' && type_id) query = query.eq('type_id', type_id);

    const take = typeof limit === 'string' ? Math.min(Number(limit) || 20, 100) : 20;
    query = query.limit(take);

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message || '문제 목록을 불러오지 못했습니다.', 500);
    }

    let rows = data ?? [];

    // 폴백: 특정 type_id에 연결된 문제가 아직 없으면, 그 유형의 category + level 범위로 재조회
    if (rows.length === 0 && typeof type_id === 'string' && type_id) {
      const { data: tp } = await supabase
        .from('problem_types')
        .select('category, level')
        .eq('id', type_id)
        .maybeSingle();
      if (tp) {
        const levelRange =
          tp.level === 'topik1' ? [1, 2] : tp.level === 'topik2_mid' ? [3, 4] : [5, 6];
        const { data: fb } = await supabase
          .from('problems')
          .select('*')
          .eq('category', tp.category)
          .in('level', levelRange)
          .order('created_at', { ascending: true })
          .limit(take);
        rows = fb ?? [];
      }
    }

    res.json({ success: true, data: rows });
  })
);

/** GET /api/problems/:id */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message || '문제를 불러오지 못했습니다.', 500);
    }
    if (!data) {
      throw new AppError('문제를 찾을 수 없습니다.', 404);
    }

    res.json({ success: true, data });
  })
);

export default router;
