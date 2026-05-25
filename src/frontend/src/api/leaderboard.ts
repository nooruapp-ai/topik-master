import client from './client';
import { ApiResponse, LeaderboardEntry } from '../types';

export async function getLeaderboard(
  period: 'weekly' | 'global'
): Promise<LeaderboardEntry[]> {
  const { data } = await client.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard/${period}`);
  return data.data;
}
