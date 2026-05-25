import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../api/leaderboard';
import { getErrorMessage } from '../api/client';
import type { LeaderboardEntry } from '../types';
import Spinner from '../components/Spinner';

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
    <div className="px-5 pt-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{t('league.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('league.subtitle')}</p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
        {(['weekly', 'global'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              period === p ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
            }`}
          >
            {t(`league.${p}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="rounded-xl bg-white p-4 text-sm text-red-500">{error}</p>
      ) : entries.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('league.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
            >
              <span className="w-8 text-center text-lg font-bold text-gray-700">
                {MEDALS[entry.rank] ?? entry.rank}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 font-semibold text-primary">
                {entry.user?.username?.charAt(0) ?? '?'}
              </div>
              <p className="flex-1 truncate font-medium text-gray-900">
                {entry.user?.username ?? '익명'}
              </p>
              <span className="font-bold text-primary">
                {t('league.points', { points: entry.score.toLocaleString() })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
