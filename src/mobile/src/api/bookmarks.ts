import client from './client';
import type { ApiResponse, SearchResults } from '../types';

export async function getBookmarks(): Promise<SearchResults> {
  const { data } = await client.get<ApiResponse<SearchResults>>('/bookmarks');
  return data.data;
}
