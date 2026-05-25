import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/** GET /api/users/:id/statistics */
router.get(
  '/:id/statistics',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      throw new AppError(userError.message || '사용자 정보를 불러오지 못했습니다.', 500);
    }
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다.', 404);
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: submissions } = await supabase
      .from('submissions')
      .select('is_correct, score')
      .eq('user_id', userId);

    const list = submissions ?? [];
    const totalSubmissions = list.length;
    const correctCount = list.filter((s) => s.is_correct).length;
    const totalScore = list.reduce((sum, s) => sum + (s.score ?? 0), 0);
    const accuracy = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

    res.json({
      success: true,
      data: {
        user,
        profile: profile ?? null,
        statistics: {
          total_submissions: totalSubmissions,
          correct_count: correctCount,
          accuracy,
          total_score: totalScore,
        },
      },
    });
  })
);

export default router;
