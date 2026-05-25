import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../api/leaderboard';
import { getErrorMessage } from '../api/client';
import type { LeaderboardEntry } from '../types';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function League() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'weekly' | 'global'>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getLeaderboard(period)
      .then((data) => {
        if (active) setEntries(data);
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
  }, [period]);

  return (
    <div>
      <TopBar title={t('league.title')} />
      <div className="px-5 pt-2">
        <p className="mb-4 text-[14px] text-ink-soft">{t('league.subtitle')}</p>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
          {(['weekly', 'global'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg py-2.5 text-[14px] font-semibold transition-colors duration-200 ${
                period === p ? 'bg-white text-primary shadow-card' : 'text-ink-soft'
              }`}
            >
              {t(`league.${p}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : entries.length === 0 ? (
          <Card className="text-[14px] text-ink-faint">{t('league.empty')}</Card>
        ) : (
          <ul className="space-y-2.5">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Card padded={false} className="flex items-center gap-3 p-4">
                  <span className="w-7 text-center text-[17px] font-bold text-ink-soft">
                    {MEDALS[entry.rank] ?? entry.rank}
                  </span>
                  <Avatar name={entry.user?.username} size="sm" />
                  <p className="flex-1 truncate text-[15px] font-medium text-ink">
                    {entry.user?.username ?? '익명'}
                  </p>
                  <span className="text-[15px] font-bold text-primary">
                    {t('league.points', { points: entry.score.toLocaleString() })}
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
