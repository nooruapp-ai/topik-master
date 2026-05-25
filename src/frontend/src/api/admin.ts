import client from './client';
import { ApiResponse, Problem } from '../types';

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  ai_generated: number;
}

export interface GenerationJob {
  id: string;
  level: string;
  category: string;
  status: string;
  total_count: number;
  success_count: number;
  created_at?: string;
  completed_at?: string | null;
}

export async function getAdminMe(): Promise<{ is_admin: boolean; role: string }> {
  const { data } = await client.get<ApiResponse<{ is_admin: boolean; role: string }>>('/admin/me');
  return data.data;
}

export async function getPendingProblems(): Promise<Problem[]> {
  const { data } = await client.get<ApiResponse<Problem[]>>('/admin/problems/pending');
  return data.data;
}

export async function getProblemStats(): Promise<AdminStats> {
  const { data } = await client.get<ApiResponse<AdminStats>>('/admin/problems/stats');
  return data.data;
}

export async function approveProblem(id: string): Promise<Problem> {
  const { data } = await client.post<ApiResponse<Problem>>(`/admin/problems/${id}/approve`);
  return data.data;
}

export async function rejectProblem(id: string, reason: string): Promise<Problem> {
  const { data } = await client.post<ApiResponse<Problem>>(`/admin/problems/${id}/reject`, {
    reason,
  });
  return data.data;
}

export async function updateProblem(
  id: string,
  patch: Partial<Pick<Problem, 'question' | 'correct_answer' | 'explanation'>>
): Promise<Problem> {
  const { data } = await client.put<ApiResponse<Problem>>(`/admin/problems/${id}`, patch);
  return data.data;
}

export async function generateProblems(payload: {
  level: string;
  category: string;
  count: number;
}): Promise<{ job: GenerationJob; created: number }> {
  const { data } = await client.post<ApiResponse<{ job: GenerationJob; created: number }>>(
    '/admin/generate-problems',
    payload
  );
  return data.data;
}
