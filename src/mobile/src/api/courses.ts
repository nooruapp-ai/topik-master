import client from './client';
import type { ApiResponse, Course } from '../types';

export async function getCourses(level?: number): Promise<Course[]> {
  const { data } = await client.get<ApiResponse<Course[]>>('/courses', {
    params: level ? { level } : undefined,
  });
  return data.data;
}

export async function getCourse(id: string): Promise<Course> {
  const { data } = await client.get<ApiResponse<Course>>(`/courses/${id}`);
  return data.data;
}
