import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const s = stats?.statistics;
  const cards = [
    { label: t('profile.totalSubmissions'), value: s?.total_submissions ?? 0, unit: t('profile.unit.count') },
    { label: t('profile.correctCount'), value: s?.correct_count ?? 0, unit: t('profile.unit.count') },
    { label: t('profile.accuracy'), value: s?.accuracy ?? 0, unit: t('profile.unit.percent') },
    { label: t('profile.totalScore'), value: s?.total_score ?? 0, unit: t('profile.unit.point') },
  ];

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
