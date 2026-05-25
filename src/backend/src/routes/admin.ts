import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { AuthRequest } from '../types';
import { generateProblems } from '../services/aiGeneration';

const router = Router();

// 모든 관리자 API 는 인증 + 관리자 권한 필요
router.use(authenticate, requireAdmin);

/** GET /api/admin/me — 프론트 권한 게이트용 */
router.get(
  '/me',
  asyncHandler<AuthRequest>(async (req, res) => {
    res.json({ success: true, data: { is_admin: true, role: req.adminRole } });
  })
);

/** GET /api/admin/problems/pending — 검토 대기 문제 */
router.get(
  '/problems/pending',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw new AppError(error.message || '검토 대기 문제를 불러오지 못했습니다.', 500);
    res.json({ success: true, data: data ?? [] });
  })
);

/** GET /api/admin/problems/stats — 상태별 통계 */
router.get(
  '/problems/stats',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase.from('problems').select('status, created_by');
    if (error) throw new AppError(error.message || '통계를 불러오지 못했습니다.', 500);

    const stats = { total: 0, pending: 0, approved: 0, rejected: 0, ai_generated: 0 };
    for (const row of data ?? []) {
      stats.total += 1;
      const s = (row.status as string) ?? 'approved';
      if (s === 'pending') stats.pending += 1;
      else if (s === 'approved') stats.approved += 1;
      else if (s === 'rejected') stats.rejected += 1;
      if ((row.created_by as string) === 'ai') stats.ai_generated += 1;
    }
    res.json({ success: true, data: stats });
  })
);

/** POST /api/admin/problems/:id/approve */
router.post(
  '/problems/:id/approve',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('problems')
      .update({ status: 'approved' })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw new AppError(error.message || '승인에 실패했습니다.', 500);
    if (!data) throw new AppError('문제를 찾을 수 없습니다.', 404);

    await supabase.from('ai_learning_log').insert({
      problem_id: req.params.id,
      action: 'approved',
    });

    res.json({ success: true, data });
  })
);

/** POST /api/admin/problems/:id/reject  body: { reason } */
router.post(
  '/problems/:id/reject',
  asyncHandler(async (req, res) => {
    const { reason } = req.body as { reason?: string };
    if (!reason || !reason.trim()) {
      throw new AppError('거부 사유를 입력해주세요.', 400);
    }

    const { data, error } = await supabase
      .from('problems')
      .update({ status: 'rejected' })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw new AppError(error.message || '거부 처리에 실패했습니다.', 500);
    if (!data) throw new AppError('문제를 찾을 수 없습니다.', 404);

    // 거부 사유를 학습 로그로 남겨 AI 생성 품질 개선에 활용
    await supabase.from('ai_learning_log').insert({
      problem_id: req.params.id,
      action: 'rejected',
      error_pattern: reason.trim(),
      lesson_learned: reason.trim(),
    });

    res.json({ success: true, data });
  })
);

/** PUT /api/admin/problems/:id — 문제 수정 */
router.put(
  '/problems/:id',
  asyncHandler(async (req, res) => {
    const allowed = [
      'question',
      'options',
      'correct_answer',
      'explanation',
      'hint',
      'detailed_explanation',
      'learning_point',
      'review_tip',
      'category',
      'level',
      'points',
      'type_id',
    ] as const;

    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) {
      throw new AppError('수정할 내용이 없습니다.', 400);
    }

    const { data, error } = await supabase
      .from('problems')
      .update(patch)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw new AppError(error.message || '수정에 실패했습니다.', 500);
    if (!data) throw new AppError('문제를 찾을 수 없습니다.', 404);

    res.json({ success: true, data });
  })
);

/** POST /api/admin/admins — 관리자 추가 (super_admin 전용)  body: { email, role } */
router.post(
  '/admins',
  asyncHandler<AuthRequest>(async (req, res) => {
    if (req.adminRole !== 'super_admin') {
      throw new AppError('최고 관리자만 관리자를 추가할 수 있습니다.', 403);
    }
    const { email, role } = req.body as { email?: string; role?: string };
    if (!email) throw new AppError('이메일이 필요합니다.', 400);

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (!user) throw new AppError('해당 이메일의 사용자를 찾을 수 없습니다.', 404);

    const nextRole = role === 'super_admin' ? 'super_admin' : 'admin';
    const { data, error } = await supabase
      .from('admins')
      .upsert({ user_id: user.id, role: nextRole }, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw new AppError(error.message || '관리자 추가에 실패했습니다.', 500);
    res.status(201).json({ success: true, data });
  })
);

/** POST /api/admin/generate-problems  body: { level, category, count } */
router.post(
  '/generate-problems',
  asyncHandler(async (req, res) => {
    const { level, category, count } = req.body as {
      level?: string;
      category?: string;
      count?: number;
    };
    if (!level || !category) {
      throw new AppError('level 과 category 는 필수입니다.', 400);
    }
    const result = await generateProblems(level, category, Number(count) || 5);
    res.status(201).json({ success: true, data: result });
  })
);

export default router;
