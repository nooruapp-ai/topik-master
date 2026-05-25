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
      .select('is_correct, score, submitted_at, problem:problems(category)')
      .eq('user_id', userId);

    const list = submissions ?? [];
    const totalSubmissions = list.length;
    const correctCount = list.filter((s) => s.is_correct).length;
    const totalScore = list.reduce((sum, s) => sum + (s.score ?? 0), 0);
    const accuracy = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

    // 영역(카테고리)별 집계 — 차트용
    const categoryMap: Record<string, { category: string; total: number; correct: number }> = {};
    for (const s of list) {
      const problem = s.problem as { category?: string } | null;
      const category = problem?.category ?? 'unknown';
      if (!categoryMap[category]) categoryMap[category] = { category, total: 0, correct: 0 };
      categoryMap[category].total += 1;
      if (s.is_correct) categoryMap[category].correct += 1;
    }
    const byCategory = Object.values(categoryMap);

    // 활동 일수 (제출이 있었던 고유 날짜 수)
    const activeDays = new Set(
      list
        .map((s) => (s.submitted_at ? new Date(s.submitted_at as string).toISOString().slice(0, 10) : null))
        .filter((d): d is string => Boolean(d))
    ).size;

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
          active_days: activeDays,
          by_category: byCategory,
        },
      },
    });
  })
);

export default router;
