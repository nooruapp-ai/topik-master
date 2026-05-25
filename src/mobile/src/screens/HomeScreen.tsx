import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ChevronRight, Flame, PencilLine } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getUserStatistics } from '../api/users';
import { getCourses } from '../api/courses';
import type { Course, UserStatistics } from '../types';
import type { MainTabParamList } from '../navigation/types';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [statsResult, coursesResult] = await Promise.allSettled([
        user ? getUserStatistics(user.id) : Promise.resolve(null),
        getCourses(),
      ]);
      if (!active) return;
      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      if (coursesResult.status === 'fulfilled') setCourses(coursesResult.value.slice(0, 3));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const totalPoints = stats?.profile?.total_points ?? stats?.statistics.total_score ?? 0;
  const streak = stats?.profile?.current_streak ?? 0;
  const level = stats?.profile?.level ?? 1;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-soft">
      <ScrollView
        contentContainerClassName="px-5 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-[14px] text-ink-soft">{t('app.name')}</Text>
          <Text className="mt-1 text-title-xl text-ink">
            {t('home.greeting', { name: user?.username ?? '' })}
          </Text>
        </View>

        {loading ? (
          <Spinner />
        ) : (
          <>
            <LinearGradient
              colors={['#6366F1', '#4F46E5'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24, marginBottom: 32 }}
            >
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-[13px] text-white/90">{t('home.totalPoints')}</Text>
                  <Text className="mt-1 text-3xl font-bold text-white">
                    {totalPoints.toLocaleString()}
                  </Text>
                </View>
                <View className="rounded-full bg-white/20 px-3 py-1">
                  <Text className="text-[13px] font-semibold text-white">
                    {t('home.level', { level })}
                  </Text>
                </View>
              </View>
              <View className="mt-4 flex-row items-center gap-1.5">
                <Flame size={16} color="#FFFFFF" />
                <Text className="text-[13px] text-white/90">
                  {t('home.streak', { days: streak })}
                </Text>
              </View>
            </LinearGradient>

            <View className="mb-8 flex-row gap-4">
              <Pressable
                onPress={() => navigation.navigate('Learning')}
                className="flex-1 active:opacity-90"
              >
                <Card>
                  <View className="mb-3 h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                    <BookOpen size={22} color="#6366F1" strokeWidth={1.75} />
                  </View>
                  <Text className="text-[16px] font-semibold text-ink">
                    {t('home.continueLearning')}
                  </Text>
                </Card>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Test')}
                className="flex-1 active:opacity-90"
              >
                <Card>
                  <View className="mb-3 h-11 w-11 items-center justify-center rounded-xl bg-accent-coral/30">
                    <PencilLine size={22} color="#D9534F" strokeWidth={1.75} />
                  </View>
                  <Text className="text-[16px] font-semibold text-ink">{t('home.quickTest')}</Text>
                </Card>
              </Pressable>
            </View>

            <Text className="mb-4 text-title-m text-ink">{t('home.recommendedCourses')}</Text>
            {courses.length === 0 ? (
              <Card>
                <Text className="text-[14px] text-ink-faint">{t('common.empty')}</Text>
              </Card>
            ) : (
              <View className="gap-4">
                {courses.map((course) => (
                  <Pressable
                    key={course.id}
                    onPress={() => navigation.navigate('Learning')}
                    className="active:opacity-90"
                  >
                    <Card className="flex-row items-center gap-4">
                      <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                        <Text className="text-[15px] font-bold text-primary">
                          {t('common.level', { level: course.level })}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-[16px] font-semibold text-ink">
                          {course.title}
                        </Text>
                        {course.description ? (
                          <Text numberOfLines={1} className="text-[14px] text-ink-soft">
                            {course.description}
                          </Text>
                        ) : null}
                      </View>
                      <ChevronRight size={20} color="#9CA3AF" strokeWidth={1.75} />
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
