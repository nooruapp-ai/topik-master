import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';

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
  const studyMinutes = (s?.total_submissions ?? 0) * 2;
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
    <div>
      <TopBar title={t('profile.title')} />
      <div className="px-5 pt-2">
        <header className="mb-6 flex items-center gap-4">
          <Avatar name={user?.username} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-title-m text-ink">{user?.username}</h1>
            <p className="truncate text-[14px] text-ink-soft">{user?.email}</p>
          </div>
        </header>

        <h2 className="mb-3 text-title-m text-ink">{t('profile.statistics')}</h2>

        {loading ? (
          <Spinner />
        ) : (
          <>
            {error && <p className="mb-3 text-[14px] text-error">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              {cards.map((card) => (
                <Card key={card.label}>
                  <p className="text-[14px] text-ink-soft">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-ink">
                    {card.value.toLocaleString()}
                    <span className="ml-1 text-[14px] font-medium text-ink-faint">{card.unit}</span>
                  </p>
                </Card>
              ))}
            </div>

            <h2 className="mb-3 mt-8 text-title-m text-ink">{t('profile.byCategory')}</h2>
            {chartData.length === 0 ? (
              <Card className="text-[14px] text-ink-faint">{t('profile.noData')}</Card>
            ) : (
              <Card>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="total" name={t('profile.totalSubmissions')} fill="#C7D2FE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="correct" name={t('profile.correctCount')} fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-btn border border-error/30 bg-white text-[16px] font-semibold text-error transition-transform duration-200 ease-ios active:scale-[0.98]"
        >
          <LogOut size={18} strokeWidth={1.75} />
          {t('profile.logout')}
        </button>
      </div>
    </div>
  );
}
