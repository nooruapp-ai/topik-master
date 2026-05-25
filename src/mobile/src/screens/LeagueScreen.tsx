import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../api/leaderboard';
import { getErrorMessage } from '../api/client';
import type { LeaderboardEntry } from '../types';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const activeSegmentShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function LeagueScreen() {
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
      .then((data) => active && setEntries(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [period]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-soft">
      <TopBar title={t('league.title')} />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-[14px] text-ink-soft">{t('league.subtitle')}</Text>

        <View className="mb-5 flex-row gap-1 rounded-xl bg-surface-muted p-1">
          {(['weekly', 'global'] as const).map((p) => {
            const active = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 rounded-lg py-2.5 ${active ? 'bg-white' : ''}`}
                style={active ? activeSegmentShadow : undefined}
              >
                <Text
                  className={`text-center text-[14px] font-semibold ${
                    active ? 'text-primary' : 'text-ink-soft'
                  }`}
                >
                  {t(`league.${p}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card>
            <Text className="text-[14px] text-error">{error}</Text>
          </Card>
        ) : entries.length === 0 ? (
          <Card>
            <Text className="text-[14px] text-ink-faint">{t('league.empty')}</Text>
          </Card>
        ) : (
          <View className="gap-2.5">
            {entries.map((entry) => (
              <Card key={entry.id} padded={false} className="flex-row items-center gap-3 p-4">
                <Text className="w-7 text-center text-[17px] font-bold text-ink-soft">
                  {MEDALS[entry.rank] ?? entry.rank}
                </Text>
                <Avatar name={entry.user?.username} size="sm" />
                <Text numberOfLines={1} className="flex-1 text-[15px] font-medium text-ink">
                  {entry.user?.username ?? t('common.anonymous')}
                </Text>
                <Text className="text-[15px] font-bold text-primary">
                  {t('league.points', { points: entry.score.toLocaleString() })}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
