import client from './client';
import { ApiResponse, Comment } from '../types';

export async function getComments(postId: string): Promise<Comment[]> {
  const { data } = await client.get<ApiResponse<Comment[]>>('/comments', {
    params: { post_id: postId },
  });
  return data.data;
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  const { data } = await client.post<ApiResponse<Comment>>('/comments', {
    post_id: postId,
    content,
  });
  return data.data;
}

export async function deleteComment(id: string): Promise<void> {
  await client.delete<ApiResponse<{ id: string }>>(`/comments/${id}`);
}
