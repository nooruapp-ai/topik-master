import client from './client';
import { ApiResponse, UserProgress } from '../types';

export async function getCourseProgress(courseId: string): Promise<UserProgress[]> {
  const { data } = await client.get<ApiResponse<UserProgress[]>>('/progress', {
    params: { course_id: courseId },
  });
  return data.data;
}

export async function saveLessonProgress(
  courseId: string,
  lessonId: string,
  percent = 100
): Promise<UserProgress> {
  const { data } = await client.post<ApiResponse<UserProgress>>('/progress', {
    course_id: courseId,
    lesson_id: lessonId,
    progress_percent: percent,
    status: 'completed',
  });
  return data.data;
}
