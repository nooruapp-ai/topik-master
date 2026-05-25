import client from './client';
import { ApiResponse, Problem } from '../types';

export interface WeaknessTag {
  tag: string;
  total: number;
  wrong: number;
}

export interface WeaknessCategory {
  category: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface Weaknesses {
  weak_grammar: WeaknessTag[];
  weak_vocabulary: WeaknessTag[];
  weak_categories: WeaknessCategory[];
  strong_areas: WeaknessCategory[];
  last_updated: string;
}

export interface Recommendations {
  weak_category: string | null;
  problems: Problem[];
}

export async function getWeaknesses(userId: string): Promise<Weaknesses> {
  const { data } = await client.get<ApiResponse<Weaknesses>>(`/users/${userId}/weaknesses`);
  return data.data;
}

export async function getRecommendations(userId: string): Promise<Recommendations> {
  const { data } = await client.get<ApiResponse<Recommendations>>(
    `/users/${userId}/recommendations`
  );
  return data.data;
}

export async function getDashboard(
  userId: string
): Promise<{ weaknesses: Weaknesses; recommendations: Recommendations }> {
  const { data } = await client.get<
    ApiResponse<{ weaknesses: Weaknesses; recommendations: Recommendations }>
  >(`/users/${userId}/dashboard`);
  return data.data;
}
