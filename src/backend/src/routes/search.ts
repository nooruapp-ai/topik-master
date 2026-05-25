import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/** GET /api/search?q=키워드  (강좌·문제·게시글 통합 검색) */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const raw = (req.query.q ?? '').toString().trim();
    // PostgREST or() 구문을 깨뜨리는 문자 제거 (,()%* 등)
    const clean = raw.replace(/[,()%*]/g, ' ').trim();

    if (!clean) {
      res.json({ success: true, data: { courses: [], problems: [], posts: [] } });
      return;
    }

    const pat = `%${clean}%`;

    const [coursesR, problemsR, postsR] = await Promise.all([
      supabase
        .from('courses')
        .select('id, title, description, level, category')
        .or(`title.ilike.${pat},description.ilike.${pat}`)
        .limit(10),
      supabase
        .from('problems')
        .select('id, question, category, level, points')
        .ilike('question', pat)
        .limit(10),
      supabase
        .from('posts')
        .select('id, title, content, category, created_at, author:users(id, username)')
        .or(`title.ilike.${pat},content.ilike.${pat}`)
        .limit(10),
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

export default router;
