import client from './client';
import { ApiResponse, Post } from '../types';

export async function getPosts(category?: string): Promise<Post[]> {
  const { data } = await client.get<ApiResponse<Post[]>>('/posts', {
    params: category ? { category } : undefined,
  });
  return data.data;
}

export async function getPost(id: string): Promise<Post> {
  const { data } = await client.get<ApiResponse<Post>>(`/posts/${id}`);
  return data.data;
}

export async function createPost(payload: {
  title: string;
  content: string;
  category?: string;
}): Promise<Post> {
  const { data } = await client.post<ApiResponse<Post>>('/posts', payload);
  return data.data;
}

export async function updatePost(
  id: string,
  payload: { title?: string; content?: string; category?: string }
): Promise<Post> {
  const { data } = await client.put<ApiResponse<Post>>(`/posts/${id}`, payload);
  return data.data;
}

export async function deletePost(id: string): Promise<void> {
  await client.delete<ApiResponse<{ id: string }>>(`/posts/${id}`);
}

export async function getLikeStatus(postId: string): Promise<boolean> {
  const { data } = await client.get<ApiResponse<{ liked: boolean }>>(`/posts/${postId}/like`);
  return data.data.liked;
}

export async function toggleLike(
  postId: string
): Promise<{ liked: boolean; like_count: number }> {
  const { data } = await client.post<ApiResponse<{ liked: boolean; like_count: number }>>(
    `/posts/${postId}/like`
  );
  return data.data;
}
