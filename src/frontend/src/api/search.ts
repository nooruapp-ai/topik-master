import client from './client';
import { ApiResponse, SearchResults } from '../types';

export async function search(q: string): Promise<SearchResults> {
  const { data } = await client.get<ApiResponse<SearchResults>>('/search', {
    params: { q },
  });
  return data.data;
}
