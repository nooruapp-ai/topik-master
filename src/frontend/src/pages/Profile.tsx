import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
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
import { getBookmarks } from '../api/bookmarks';
import { getAdminMe } from '../api/admin';
import WeaknessReport from '../components/WeaknessReport';
import { getErrorMessage } from '../api/client';
import type { UserStatistics, SearchResults } from '../types';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'stats' | 'saved' | 'analysis'>('stats');
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [saved, setSaved] = useState<SearchResults | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 관리자면 콘솔 진입 링크 노출 (비관리자는 403 → 무시)
  useEffect(() => {
    let active = true;
    getAdminMe()
      .then(() => active && setIsAdmin(true))
      .catch(() => active && setIsAdmin(false));
    return () => {
      active = false;
    };
  }, []);

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

  useEffect(() => {
    if (tab !== 'saved' || saved) return;
    let active = true;
    setSavedLoading(true);
    getBookmarks()
      .then((data) => active && setSaved(data))
      .catch(() => active && setSaved({ courses: [], problems: [], posts: [] }))
      .finally(() => active && setSavedLoading(false));
    return () => {
      active = false;
    };
  }, [tab, saved]);

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

  const savedCount = saved
    ? saved.courses.length + saved.problems.length + saved.posts.length
    : 0;

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

        <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-surface-muted p-1">
          {(['stats', 'saved', 'analysis'] as const).map((tk) => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={`rounded-lg py-2.5 text-[13px] font-semibold transition-colors duration-200 ${
                tab === tk ? 'bg-white text-primary shadow-card' : 'text-ink-soft'
              }`}
            >
              {tk === 'stats' ? t('profile.tabStats') : tk === 'saved' ? t('profile.tabSaved') : '분석'}
            </button>
          ))}
        </div>

        {tab === 'analysis' ? (
          user ? <WeaknessReport userId={user.id} /> : null
        ) : tab === 'stats' ? (
          loading ? (
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
          )
        ) : savedLoading ? (
          <Spinner />
        ) : savedCount === 0 ? (
          <EmptyState emoji="🔖" title={t('profile.savedEmpty')} />
        ) : (
          <div className="space-y-3">
            {saved!.courses.map((c) => (
              <Link key={c.id} to={`/learning/${c.id}`}>
                <Card className="flex items-center gap-3 transition-transform duration-200 ease-ios active:scale-[0.99]">
                  <Badge>{t('common.level', { level: c.level })}</Badge>
                  <p className="text-[15px] font-semibold text-ink">{c.title}</p>
                </Card>
              </Link>
            ))}
            {saved!.posts.map((p) => (
              <Link key={p.id} to={`/community/${p.id}`}>
                <Card className="transition-transform duration-200 ease-ios active:scale-[0.99]">
                  <Badge tone="neutral">{t(`community.categoryFilter.${p.category}`, p.category)}</Badge>
                  <p className="mt-1.5 text-[15px] font-semibold text-ink">{p.title}</p>
                </Card>
              </Link>
            ))}
            {saved!.problems.map((p) => (
              <Card key={p.id}>
                <Badge tone="mint">{t(`test.category.${p.category}`, p.category)}</Badge>
                <p className="mt-1.5 text-[15px] text-ink">{p.question}</p>
              </Card>
            ))}
          </div>
        )}

        {isAdmin && (
          <Link
            to="/admin"
            className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-btn border border-primary/30 bg-primary-light text-[16px] font-semibold text-primary transition-transform duration-200 ease-ios active:scale-[0.98]"
          >
            <ShieldCheck size={18} strokeWidth={1.75} />
            관리자 콘솔
          </Link>
        )}

        <button
          onClick={handleLogout}
          className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-btn border border-error/30 bg-white text-[16px] font-semibold text-error transition-transform duration-200 ease-ios active:scale-[0.98] ${
            isAdmin ? 'mt-3' : 'mt-8'
          }`}
        >
          <LogOut size={18} strokeWidth={1.75} />
          {t('profile.logout')}
        </button>
      </div>
    </div>
  );
}
