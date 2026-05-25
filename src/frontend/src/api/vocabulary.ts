import client from './client';
import { ApiResponse, Vocabulary } from '../types';

export async function getVocabulary(params?: {
  level?: number;
  theme?: string;
  limit?: number;
}): Promise<Vocabulary[]> {
  const { data } = await client.get<ApiResponse<Vocabulary[]>>('/vocabulary', { params });
  return data.data;
}
