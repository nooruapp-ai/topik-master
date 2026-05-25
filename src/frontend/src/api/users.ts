import client from './client';
import { ApiResponse, UserStatistics } from '../types';

export async function getUserStatistics(userId: string): Promise<UserStatistics> {
  const { data } = await client.get<ApiResponse<UserStatistics>>(
    `/users/${userId}/statistics`
  );
  return data.data;
}
