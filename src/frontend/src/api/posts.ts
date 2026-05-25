import client from './client';
import { ApiResponse, Post } from '../types';

export async function getPosts(category?: string): Promise<Post[]> {
  const { data } = await client.get<ApiResponse<Post[]>>('/posts', {
    params: category ? { category } : undefined,
  });
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
