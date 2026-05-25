import client from './client';
import { ApiResponse, ProblemType } from '../types';

export async function getProblemTypes(params: {
  level?: string;
  category?: string;
}): Promise<ProblemType[]> {
  const { data } = await client.get<ApiResponse<ProblemType[]>>('/problem-types', { params });
  return data.data;
}

export async function getProblemType(id: string): Promise<ProblemType> {
  const { data } = await client.get<ApiResponse<ProblemType>>(`/problem-types/${id}`);
  return data.data;
}
