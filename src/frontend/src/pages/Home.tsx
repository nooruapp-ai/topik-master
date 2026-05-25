import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserStatistics } from '../api/users';
import { getCourses } from '../api/courses';
import type { UserStatistics, Course } from '../types';
import Spinner from '../components/Spinner';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [statsResult, coursesResult] = await Promise.allSettled([
        user ? getUserStatistics(user.id) : Promise.resolve(null),
        getCourses(),
      ]);
      if (!active) return;
      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      if (coursesResult.status === 'fulfilled') setCourses(coursesResult.value.slice(0, 3));
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) return <Spinner />;

  const totalPoints = stats?.profile?.total_points ?? stats?.statistics.total_score ?? 0;
  const streak = stats?.profile?.current_streak ?? 0;

  return (
    <div className="px-5 pt-6">
      <header className="mb-6">
        <p className="text-sm text-gray-500">{t('app.name')}</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">
          {t('home.greeting', { name: user?.username ?? '' })}
        </h1>
      </header>

      <section className="mb-6 rounded-2xl bg-primary p-5 text-white">
        <p className="text-sm opacity-90">{t('home.totalPoints')}</p>
        <p className="mt-1 text-3xl font-bold">{totalPoints.toLocaleString()}</p>
        <p className="mt-3 text-sm opacity-90">{t('home.streak', { days: streak })}</p>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3">
        <Link
          to="/learning"
          className="rounded-2xl border border-gray-200 bg-white p-4 transition active:scale-[.98]"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-xl">
            📚
          </div>
          <p className="font-semibold text-gray-900">{t('home.continueLearning')}</p>
        </Link>
        <Link
          to="/test"
          className="rounded-2xl border border-gray-200 bg-white p-4 transition active:scale-[.98]"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-xl">
            ✏️
          </div>
          <p className="font-semibold text-gray-900">{t('home.quickTest')}</p>
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">{t('home.recommendedCourses')}</h2>
        {courses.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('common.empty')}</p>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 font-bold text-primary">
                  {t('common.level', { level: course.level })}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{course.title}</p>
                  {course.description && (
                    <p className="truncate text-sm text-gray-500">{course.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
