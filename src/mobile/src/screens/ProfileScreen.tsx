import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getUserStatistics } from '../api/users';
import { getBookmarks } from '../api/bookmarks';
import { getErrorMessage } from '../api/client';
import type { SearchResults, UserStatistics } from '../types';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

const activeSegmentShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState<'stats' | 'saved'>('stats');
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [saved, setSaved] = useState<SearchResults | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);

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
  const maxTotal = Math.max(1, ...chartData.map((c) => c.total));

  const savedCount = saved
    ? saved.courses.length + saved.problems.length + saved.posts.length
    : 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-soft">
      <TopBar title={t('profile.title')} />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="mb-6 flex-row items-center gap-4">
          <Avatar name={user?.username} size="lg" />
          <View className="flex-1">
            <Text numberOfLines={1} className="text-title-m text-ink">
              {user?.username}
            </Text>
            <Text numberOfLines={1} className="text-[14px] text-ink-soft">
              {user?.email}
            </Text>
          </View>
        </View>

        <View className="mb-5 flex-row gap-1 rounded-xl bg-surface-muted p-1">
          {(['stats', 'saved'] as const).map((tk) => {
            const active = tab === tk;
            return (
              <Pressable
                key={tk}
                onPress={() => setTab(tk)}
                className={`flex-1 rounded-lg py-2.5 ${active ? 'bg-white' : ''}`}
                style={active ? activeSegmentShadow : undefined}
              >
                <Text
                  className={`text-center text-[14px] font-semibold ${
                    active ? 'text-primary' : 'text-ink-soft'
                  }`}
                >
                  {tk === 'stats' ? t('profile.tabStats') : t('profile.tabSaved')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'stats' ? (
          loading ? (
            <Spinner />
          ) : (
            <>
              {error ? <Text className="mb-3 text-[14px] text-error">{error}</Text> : null}

              <View className="flex-row flex-wrap justify-between gap-y-4">
                {cards.map((card) => (
                  <View key={card.label} className="w-[48%]">
                    <Card>
                      <Text className="text-[14px] text-ink-soft">{card.label}</Text>
                      <Text className="mt-1 text-2xl font-bold text-ink">
                        {card.value.toLocaleString()}
                        <Text className="text-[14px] font-medium text-ink-faint"> {card.unit}</Text>
                      </Text>
                    </Card>
                  </View>
                ))}
              </View>

              <Text className="mb-3 mt-8 text-title-m text-ink">{t('profile.byCategory')}</Text>
              {chartData.length === 0 ? (
                <Card>
                  <Text className="text-[14px] text-ink-faint">{t('profile.noData')}</Text>
                </Card>
              ) : (
                <Card>
                  <View className="mb-4 flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1.5">
                      <View className="h-2.5 w-2.5 rounded-sm bg-[#C7D2FE]" />
                      <Text className="text-[12px] text-ink-soft">
                        {t('profile.totalSubmissions')}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <View className="h-2.5 w-2.5 rounded-sm bg-primary" />
                      <Text className="text-[12px] text-ink-soft">{t('profile.correctCount')}</Text>
                    </View>
                  </View>
                  <View className="gap-3.5">
                    {chartData.map((c) => (
                      <View key={c.name}>
                        <View className="mb-1 flex-row justify-between">
                          <Text className="text-[13px] text-ink-soft">{c.name}</Text>
                          <Text className="text-[13px] text-ink-faint">
                            {c.correct}/{c.total}
                          </Text>
                        </View>
                        <View className="gap-1">
                          <View className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                            <View
                              className="h-full rounded-full bg-[#C7D2FE]"
                              style={{ width: `${(c.total / maxTotal) * 100}%` }}
                            />
                          </View>
                          <View className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                            <View
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(c.correct / maxTotal) * 100}%` }}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </Card>
              )}
            </>
          )
        ) : savedLoading ? (
          <Spinner />
        ) : savedCount === 0 ? (
          <EmptyState emoji="🔖" title={t('profile.savedEmpty')} />
        ) : (
          <View className="gap-3">
            {saved!.courses.map((c) => (
              <Card key={c.id} className="flex-row items-center gap-3">
                <Badge>{t('common.level', { level: c.level })}</Badge>
                <Text className="flex-1 text-[15px] font-semibold text-ink">{c.title}</Text>
              </Card>
            ))}
            {saved!.posts.map((p) => (
              <Card key={p.id}>
                <Badge tone="neutral">
                  {t(`community.categoryFilter.${p.category}`, p.category)}
                </Badge>
                <Text className="mt-1.5 text-[15px] font-semibold text-ink">{p.title}</Text>
              </Card>
            ))}
            {saved!.problems.map((p) => (
              <Card key={p.id}>
                <Badge tone="mint">{t(`test.category.${p.category}`, p.category)}</Badge>
                <Text className="mt-1.5 text-[15px] text-ink">{p.question}</Text>
              </Card>
            ))}
          </View>
        )}

        <Pressable
          onPress={logout}
          className="mt-8 h-[52px] flex-row items-center justify-center gap-2 rounded-btn border border-error/30 bg-white active:opacity-90"
        >
          <LogOut size={18} color="#EF4444" strokeWidth={1.75} />
          <Text className="text-[16px] font-semibold text-error">{t('profile.logout')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
