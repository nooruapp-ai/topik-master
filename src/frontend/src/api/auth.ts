import client from './client';
import { ApiResponse, User } from '../types';

interface AuthData {
  user: User;
  token: string;
}

export async function signup(payload: {
  email: string;
  password: string;
  username: string;
}): Promise<AuthData> {
  const { data } = await client.post<ApiResponse<AuthData>>('/auth/signup', payload);
  return data.data;
}

export async function login(payload: { email: string; password: string }): Promise<AuthData> {
  const { data } = await client.post<ApiResponse<AuthData>>('/auth/login', payload);
  return data.data;
}
