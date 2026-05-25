import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();

async function fetchLeaderboard(period: 'weekly' | 'global') {
  const { data, error } = await supabase
    .from('leaderboards')
    .select('*, user:users(id, username)')
    .eq('period', period)
    .order('rank', { ascending: true })
    .limit(100);

  if (error) {
    throw new AppError(error.message || '리더보드를 불러오지 못했습니다.', 500);
  }
  return data ?? [];
}

/** GET /api/leaderboard/weekly */
router.get(
  '/weekly',
  asyncHandler(async (_req, res) => {
    const data = await fetchLeaderboard('weekly');
    res.json({ success: true, data });
  })
);

/** GET /api/leaderboard/global */
router.get(
  '/global',
  asyncHandler(async (_req, res) => {
    const data = await fetchLeaderboard('global');
    res.json({ success: true, data });
  })
);

export default router;
