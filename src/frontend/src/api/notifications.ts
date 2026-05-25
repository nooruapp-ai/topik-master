import client from './client';
import { ApiResponse, AppNotification } from '../types';

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await client.get<ApiResponse<AppNotification[]>>('/notifications');
  return data.data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await client.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  return data.data.count;
}

export async function markRead(id: string): Promise<void> {
  await client.post<ApiResponse<{ id: string }>>(`/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await client.post<ApiResponse<{ ok: boolean }>>('/notifications/read-all');
}
