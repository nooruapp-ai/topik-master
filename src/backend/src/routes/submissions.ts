import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { awardXp, recomputeStreak } from '../utils/gamification';

const router = Router();

/** POST /api/submissions  body: { problem_id, answer } */
router.post(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { problem_id, answer } = req.body as { problem_id?: string; answer?: string };
    const userId = req.user!.userId;

    if (!problem_id || answer === undefined) {
      throw new AppError('problem_id 와 answer 는 필수입니다.', 400);
    }

    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('id, correct_answer, points, explanation')
      .eq('id', problem_id)
      .maybeSingle();

    if (problemError) {
      throw new AppError(problemError.message || '문제 조회에 실패했습니다.', 500);
    }
    if (!problem) {
      throw new AppError('문제를 찾을 수 없습니다.', 404);
    }

    const isCorrect =
      String(answer).trim().toLowerCase() ===
      String(problem.correct_answer).trim().toLowerCase();
    const score = isCorrect ? problem.points ?? 0 : 0;

    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        problem_id,
        user_answer: String(answer),
        is_correct: isCorrect,
        score,
      })
      .select('*')
      .single();

    if (error || !submission) {
      throw new AppError(error?.message ?? '제출 저장에 실패했습니다.', 500);
    }

    // 게임화: 문제 풀이 +10XP, 스트릭 재계산 (best-effort)
    await awardXp(userId, 10);
    await recomputeStreak(userId);

    res.status(201).json({
      success: true,
      data: {
        submission,
        is_correct: isCorrect,
        score,
        correct_answer: problem.correct_answer,
        explanation: problem.explanation ?? null,
      },
    });
  })
);

/** GET /api/submissions  (내 제출 내역) */
router.get(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const userId = req.user!.userId;
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new AppError(error.message || '제출 내역을 불러오지 못했습니다.', 500);
    }

    res.json({ success: true, data: data ?? [] });
  })
);

export default router;
