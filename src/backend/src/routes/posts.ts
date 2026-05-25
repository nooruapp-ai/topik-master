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

export default router;
