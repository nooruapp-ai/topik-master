import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';
import { TOKEN_KEY, USER_KEY, setUnauthorizedHandler } from '../api/client';
import * as authApi from '../api/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 AsyncStorage 에서 세션 복원 (웹의 localStorage 대체)
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (active && storedToken && storedUser) {
          setUser(JSON.parse(storedUser) as User);
          setToken(storedToken);
        }
      } catch {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 401 인터셉터가 호출할 로그아웃 핸들러 등록
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function persist(nextUser: User, nextToken: string) {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, nextToken],
      [USER_KEY, JSON.stringify(nextUser)],
    ]);
    setUser(nextUser);
    setToken(nextToken);
  }

  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password });
    await persist(result.user, result.token);
  }

  async function signup(email: string, password: string, username: string) {
    const result = await authApi.signup({ email, password, username });
    await persist(result.user, result.token);
  }

  function logout() {
    void AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
    setToken(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      signup,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
