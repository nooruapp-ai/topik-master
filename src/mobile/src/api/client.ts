import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

export const TOKEN_KEY = 'topik_token';
export const USER_KEY = 'topik_user';

// 401 발생 시 AuthProvider 가 등록하는 로그아웃 콜백.
// 웹의 window.location 리다이렉트를 대체합니다.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

/**
 * 베이스 URL 을 결정합니다.
 * Expo Go/시뮬레이터에서 localhost 는 디바이스 자신을 가리키므로,
 * Metro 디버거 호스트(개발 PC 의 LAN IP)로 치환해 백엔드에 접근합니다.
 */
function resolveBaseURL(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];

  if (configured) {
    if (host && /localhost|127\.0\.0\.1/.test(configured)) {
      return configured.replace(/localhost|127\.0\.0\.1/, host);
    }
    return configured;
  }
  if (host) return `http://${host}:5000/api`;
  return 'http://localhost:5000/api';
}

const client = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// 모든 요청에 JWT 토큰 첨부 (AsyncStorage 는 비동기)
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401: 세션 만료 → 토큰 삭제 후 로그아웃 트리거. 네트워크/서버 오류는 안내.
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      onUnauthorized?.();
    } else if (!error.response) {
      Alert.alert('네트워크 오류', '네트워크 연결을 확인해주세요.');
    } else if (error.response.status >= 500) {
      Alert.alert('서버 오류', '서버 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
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
