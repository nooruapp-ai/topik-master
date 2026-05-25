import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

/** GET /api/posts?category=free */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let query = supabase
      .from('posts')
      .select('*, author:users(id, username)')
      .order('created_at', { ascending: false })
      .limit(50);

    const { category } = req.query;
    if (typeof category === 'string' && category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message || '게시글을 불러오지 못했습니다.', 500);
    }

    res.json({ success: true, data: data ?? [] });
  })
);

/** POST /api/posts  body: { title, content, category? } */
router.post(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { title, content, category } = req.body as {
      title?: string;
      content?: string;
      category?: string;
    };
    const userId = req.user!.userId;

    if (!title || !content) {
      throw new AppError('제목과 내용을 입력해주세요.', 400);
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title,
        content,
        category: category ?? 'free',
      })
      .select('*, author:users(id, username)')
      .single();

    if (error || !data) {
      throw new AppError(error?.message ?? '게시글 작성에 실패했습니다.', 500);
    }

    res.status(201).json({ success: true, data });
  })
);

/** GET /api/posts/:id (상세) */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:users(id, username)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message || '게시글을 불러오지 못했습니다.', 500);
    }
    if (!data) {
      throw new AppError('게시글을 찾을 수 없습니다.', 404);
    }

    res.json({ success: true, data });
  })
);

async function findPostOwner(id: string, userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new AppError(error.message || '게시글 조회에 실패했습니다.', 500);
  if (!data) throw new AppError('게시글을 찾을 수 없습니다.', 404);
  if (data.user_id !== userId) throw new AppError('본인 게시글만 수정/삭제할 수 있습니다.', 403);
}

/** PUT /api/posts/:id (수정, 작성자만) */
router.put(
  '/:id',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { title, content, category } = req.body as {
      title?: string;
      content?: string;
      category?: string;
    };
    await findPostOwner(req.params.id, req.user!.userId);

    const patch: Record<string, string> = {};
    if (title !== undefined) patch.title = title;
    if (content !== undefined) patch.content = content;
    if (category !== undefined) patch.category = category;
    if (Object.keys(patch).length === 0) {
      throw new AppError('수정할 내용이 없습니다.', 400);
    }

    const { data, error } = await supabase
      .from('posts')
      .update(patch)
      .eq('id', req.params.id)
      .select('*, author:users(id, username)')
      .single();

    if (error || !data) {
      throw new AppError(error?.message ?? '게시글 수정에 실패했습니다.', 500);
    }

    res.json({ success: true, data });
  })
);

/** DELETE /api/posts/:id (삭제, 작성자만) */
router.delete(
  '/:id',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    await findPostOwner(req.params.id, req.user!.userId);

    const { error } = await supabase.from('posts').delete().eq('id', req.params.id);
    if (error) {
      throw new AppError(error.message || '게시글 삭제에 실패했습니다.', 500);
    }

    res.json({ success: true, data: { id: req.params.id } });
  })
);

export default router;
