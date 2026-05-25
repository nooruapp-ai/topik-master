import client from './client';
import type { ApiResponse, Problem, SubmissionResult } from '../types';

export async function getProblems(params?: {
  category?: string;
  level?: number;
  limit?: number;
}): Promise<Problem[]> {
  const { data } = await client.get<ApiResponse<Problem[]>>('/problems', { params });
  return data.data;
}

export async function submitAnswer(payload: {
  problem_id: string;
  answer: string;
}): Promise<SubmissionResult> {
  const { data } = await client.post<ApiResponse<SubmissionResult>>('/submissions', payload);
  return data.data;
}
