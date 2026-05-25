import axios, { AxiosError } from 'axios';
import { showToast } from '../lib/toast';

export const TOKEN_KEY = 'topik_token';
export const USER_KEY = 'topik_user';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// 모든 요청에 JWT 토큰 첨부
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 응답 시 로그아웃 처리
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'info');
        window.location.href = '/login';
      }
    } else if (!error.response) {
      // 응답 자체가 없으면 네트워크 단절
      showToast('네트워크 연결을 확인해주세요.', 'error');
    } else if (error.response.status >= 500) {
      showToast('서버 오류가 발생했어요. 잠시 후 다시 시도해주세요.', 'error');
    }
    return Promise.reject(error);
  }
);

/** axios 에러에서 사용자에게 보여줄 메시지를 추출합니다. */
export function getErrorMessage(err: unknown, fallback = '오류가 발생했습니다.'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default client;
