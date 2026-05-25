import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { getCourses } from '../api/courses';
import { getErrorMessage } from '../api/client';
import type { Course } from '../types';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const LEVELS = [0, 1, 2, 3, 4, 5, 6];

export default function LearningScreen() {
  const { t } = useTranslation();
  const [level, setLevel] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getCourses(level || undefined)
      .then((data) => active && setCourses(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [level]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-soft">
      <TopBar title={t('learning.title')} />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-[14px] text-ink-soft">{t('learning.subtitle')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
          className="mb-5"
        >
          {LEVELS.map((lv) => {
            const active = level === lv;
            return (
              <Pressable
                key={lv}
                onPress={() => setLevel(lv)}
                className={`rounded-full px-4 py-2 ${
                  active ? 'bg-primary' : 'border border-line bg-white'
                }`}
              >
                <Text
                  className={`text-[14px] font-medium ${active ? 'text-white' : 'text-ink-soft'}`}
                >
                  {lv === 0 ? t('learning.allLevels') : t('common.level', { level: lv })}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card>
            <Text className="text-[14px] text-error">{error}</Text>
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <Text className="text-[14px] text-ink-faint">{t('learning.empty')}</Text>
          </Card>
        ) : (
          <View className="gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <View className="mb-2 flex-row items-center gap-2">
                  <Badge tone="primary">{t('common.level', { level: course.level })}</Badge>
                  {course.category ? (
                    <Text className="text-[12px] text-ink-faint">{course.category}</Text>
                  ) : null}
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <Text className="text-[16px] font-semibold text-ink">{course.title}</Text>
                    {course.description ? (
                      <Text className="mt-1 text-[14px] text-ink-soft">{course.description}</Text>
                    ) : null}
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" strokeWidth={1.75} />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
