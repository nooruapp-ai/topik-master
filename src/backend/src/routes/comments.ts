import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { createNotification } from '../utils/notify';

const router = Router();

async function bumpCommentCount(postId: string, delta: number) {
  const { data: post } = await supabase
    .from('posts')
    .select('comment_count')
    .eq('id', postId)
    .maybeSingle();
  const next = Math.max(0, (post?.comment_count ?? 0) + delta);
  await supabase.from('posts').update({ comment_count: next }).eq('id', postId);
}

/** GET /api/comments?post_id=X */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { post_id } = req.query;
    if (typeof post_id !== 'string' || !post_id) {
      throw new AppError('post_id 쿼리가 필요합니다.', 400);
    }
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:users(id, username)')
      .eq('post_id', post_id)
      .order('created_at', { ascending: true });
    if (error) {
      throw new AppError(error.message || '댓글을 불러오지 못했습니다.', 500);
    }
    res.json({ success: true, data: data ?? [] });
  })
);

/** POST /api/comments  body: { post_id, content } */
router.post(
  '/',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { post_id, content } = req.body as { post_id?: string; content?: string };
    if (!post_id || !content) {
      throw new AppError('post_id 와 content 는 필수입니다.', 400);
    }
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id, user_id: req.user!.userId, content })
      .select('*, author:users(id, username)')
      .single();
    if (error || !data) {
      throw new AppError(error?.message ?? '댓글 작성에 실패했습니다.', 500);
    }
    await bumpCommentCount(post_id, 1);

    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', post_id)
      .maybeSingle();
    if (post) {
      await createNotification({
        userId: post.user_id,
        actorId: req.user!.userId,
        type: 'comment',
        targetType: 'post',
        targetId: post_id,
        message: '회원님의 글에 댓글을 남겼습니다.',
      });
    }

    res.status(201).json({ success: true, data });
  })
);

/** DELETE /api/comments/:id (작성자만) */
router.delete(
  '/:id',
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const { data: comment, error: findErr } = await supabase
      .from('comments')
      .select('id, user_id, post_id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (findErr) throw new AppError(findErr.message, 500);
    if (!comment) throw new AppError('댓글을 찾을 수 없습니다.', 404);
    if (comment.user_id !== req.user!.userId) {
      throw new AppError('본인 댓글만 삭제할 수 있습니다.', 403);
    }
    const { error } = await supabase.from('comments').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    await bumpCommentCount(comment.post_id, -1);
    res.json({ success: true, data: { id: req.params.id } });
  })
);

export default router;
