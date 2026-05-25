import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, PencilLine, Flame, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserStatistics } from '../api/users';
import { getCourses } from '../api/courses';
import type { UserStatistics, Course } from '../types';
import Spinner from '../components/Spinner';
import Card from '../components/ui/Card';
import SearchBar from '../components/ui/SearchBar';
import NotificationBell from '../components/ui/NotificationBell';

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
  const level = stats?.profile?.level ?? 1;

  return (
    <div className="px-5 pt-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[14px] text-ink-soft">{t('app.name')}</p>
          <h1 className="mt-1 text-title-xl text-ink">{t('home.greeting', { name: user?.username ?? '' })}</h1>
        </div>
        <NotificationBell />
      </header>

      <div className="mb-6">
        <SearchBar />
      </div>

      <section className="mb-8 overflow-hidden rounded-xl3 bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-elevated">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] opacity-90">{t('home.totalPoints')}</p>
            <p className="mt-1 text-3xl font-bold">{totalPoints.toLocaleString()}</p>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[13px] font-semibold">
            {t('home.level', { level })}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-[13px] opacity-90">
          <Flame size={16} strokeWidth={2} />
          {t('home.streak', { days: streak })}
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-4">
        <Link
          to="/learning"
          className="rounded-card border border-surface-muted bg-white p-5 shadow-card transition-transform duration-200 ease-ios active:scale-[0.98]"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
            <BookOpen size={22} strokeWidth={1.75} />
          </div>
          <p className="text-[16px] font-semibold text-ink">{t('home.continueLearning')}</p>
        </Link>
        <Link
          to="/test"
          className="rounded-card border border-surface-muted bg-white p-5 shadow-card transition-transform duration-200 ease-ios active:scale-[0.98]"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-coral/30 text-[#D9534F]">
            <PencilLine size={22} strokeWidth={1.75} />
          </div>
          <p className="text-[16px] font-semibold text-ink">{t('home.quickTest')}</p>
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-title-m text-ink">{t('home.recommendedCourses')}</h2>
        {courses.length === 0 ? (
          <Card className="text-[14px] text-ink-faint">{t('common.empty')}</Card>
        ) : (
          <ul className="space-y-4">
            {courses.map((course) => (
              <li key={course.id}>
                <Link to={`/learning/${course.id}`}>
                  <Card className="flex items-center gap-4 transition-transform duration-200 ease-ios active:scale-[0.99]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-[15px] font-bold text-primary">
                      {t('common.level', { level: course.level })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold text-ink">{course.title}</p>
                      {course.description && (
                        <p className="truncate text-[14px] text-ink-soft">{course.description}</p>
                      )}
                    </div>
                    <ChevronRight size={20} strokeWidth={1.75} className="text-ink-faint" />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
