import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getUserStatistics } from '../api/users';
import { getErrorMessage } from '../api/client';
import type { UserStatistics } from '../types';
import Spinner from '../components/Spinner';

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    getUserStatistics(user.id)
      .then((data) => active && setStats(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const s = stats?.statistics;
  const studyMinutes = (s?.total_submissions ?? 0) * 2; // 문제당 약 2분 추정
  const cards = [
    { label: t('profile.totalSubmissions'), value: s?.total_submissions ?? 0, unit: t('profile.unit.count') },
    { label: t('profile.accuracy'), value: s?.accuracy ?? 0, unit: t('profile.unit.percent') },
    { label: t('profile.studyTime'), value: studyMinutes, unit: t('profile.unit.minute') },
    { label: t('profile.totalScore'), value: s?.total_score ?? 0, unit: t('profile.unit.point') },
  ];

  const chartData = (s?.by_category ?? []).map((c) => ({
    name: t(`test.category.${c.category}`, c.category),
    total: c.total,
    correct: c.correct,
  }));

  return (
    <div className="px-5 pt-6">
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
          {user?.username?.charAt(0) ?? '?'}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-gray-900">{user?.username}</h1>
          <p className="truncate text-sm text-gray-500">{user?.email}</p>
        </div>
      </header>

      <h2 className="mb-3 text-lg font-bold text-gray-900">{t('profile.statistics')}</h2>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                  <span className="ml-1 text-sm font-medium text-gray-400">{card.unit}</span>
                </p>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-lg font-bold text-gray-900">{t('profile.byCategory')}</h2>
          {chartData.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('profile.noData')}</p>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name={t('profile.totalSubmissions')} fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="correct" name={t('profile.correctCount')} fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <button
        onClick={handleLogout}
        className="mt-8 w-full rounded-xl border border-red-200 bg-white py-3 font-semibold text-red-500 transition active:scale-[.99]"
      >
        {t('profile.logout')}
      </button>
    </div>
  );
}
