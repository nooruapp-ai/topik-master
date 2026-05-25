import client from './client';
import { ApiResponse, SearchResults } from '../types';

export type BookmarkTarget = 'course' | 'problem' | 'post';

export async function getBookmarks(): Promise<SearchResults> {
  const { data } = await client.get<ApiResponse<SearchResults>>('/bookmarks');
  return data.data;
}

export async function getBookmarkStatus(type: BookmarkTarget, id: string): Promise<boolean> {
  const { data } = await client.get<ApiResponse<{ bookmarked: boolean }>>('/bookmarks/status', {
    params: { target_type: type, target_id: id },
  });
  return data.data.bookmarked;
}

export async function toggleBookmark(
  type: BookmarkTarget,
  id: string
): Promise<{ bookmarked: boolean }> {
  const { data } = await client.post<ApiResponse<{ bookmarked: boolean }>>('/bookmarks', {
    target_type: type,
    target_id: id,
  });
  return data.data;
}
