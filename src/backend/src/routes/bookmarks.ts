import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const TYPES = ['course', 'problem', 'post'];

/** GET /api/bookmarks  (저장한 콘텐츠 — 타입별로 묶어 상세 반환) */
router.get(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { data: bms, error } = await supabase
      .from('bookmarks')
      .select('target_type, target_id, created_at')
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message || '북마크를 불러오지 못했습니다.', 500);

    const ids: Record<string, string[]> = { course: [], problem: [], post: [] };
    for (const b of bms ?? []) {
      if (ids[b.target_type]) ids[b.target_type].push(b.target_id);
    }

    const [coursesR, problemsR, postsR] = await Promise.all([
      supabase.from('courses').select('id, title, description, level, category').in('id', ids.course),
      supabase.from('problems').select('id, question, category, level, points').in('id', ids.problem),
      supabase.from('posts').select('id, title, content, category, created_at').in('id', ids.post),
    ]);

    res.json({
      success: true,
      data: {
        courses: coursesR.data ?? [],
        problems: problemsR.data ?? [],
        posts: postsR.data ?? [],
      },
    });
  })
);

/** GET /api/bookmarks/status?target_type=&target_id= */
router.get(
  '/status',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { target_type, target_id } = req.query;
    if (typeof target_type !== 'string' || typeof target_id !== 'string') {
      throw new AppError('target_type 과 target_id 가 필요합니다.', 400);
    }
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', req.user!.userId)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .maybeSingle();
    res.json({ success: true, data: { bookmarked: Boolean(data) } });
  })
);

/** POST /api/bookmarks  body: { target_type, target_id }  (토글) */
router.post(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { target_type, target_id } = req.body as { target_type?: string; target_id?: string };
    if (!target_type || !target_id || !TYPES.includes(target_type)) {
      throw new AppError('유효한 target_type(course/problem/post) 과 target_id 가 필요합니다.', 400);
    }
    const userId = req.user!.userId;

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .maybeSingle();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      res.json({ success: true, data: { bookmarked: false } });
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: userId, target_type, target_id });
      if (error) throw new AppError(error.message || '북마크 저장에 실패했습니다.', 500);
      res.json({ success: true, data: { bookmarked: true } });
    }
  })
);

export default router;
