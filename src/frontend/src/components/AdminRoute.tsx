import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminMe } from '../api/admin';
import Spinner from './Spinner';

// 관리자만 접근 가능한 라우트 가드. /api/admin/me 로 권한을 확인합니다.
export default function AdminRoute() {
  const { isAuthenticated, loading } = useAuth();
  const [state, setState] = useState<'checking' | 'ok' | 'deny'>('checking');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setState('deny');
      return;
    }
    let active = true;
    getAdminMe()
      .then(() => active && setState('ok'))
      .catch(() => active && setState('deny'));
    return () => {
      active = false;
    };
  }, [loading, isAuthenticated]);

  if (loading || state === 'checking') return <Spinner fullScreen />;
  return state === 'ok' ? <Outlet /> : <Navigate to="/" replace />;
}
