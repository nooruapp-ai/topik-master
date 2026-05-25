import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { getCourses } from '../api/courses';
import { getErrorMessage } from '../api/client';
import type { Course } from '../types';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const LEVELS = [0, 1, 2, 3, 4, 5, 6];

export default function Learning() {
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
      .then((data) => {
        if (active) setCourses(data);
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
  }, [level]);

  return (
    <div>
      <TopBar title={t('learning.title')} />
      <div className="px-5 pt-2">
        <p className="mb-4 text-[14px] text-ink-soft">{t('learning.subtitle')}</p>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-200 ${
                level === lv ? 'bg-primary text-white' : 'border border-line bg-white text-ink-soft'
              }`}
            >
              {lv === 0 ? t('learning.allLevels') : t('common.level', { level: lv })}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : courses.length === 0 ? (
          <Card className="text-[14px] text-ink-faint">{t('learning.empty')}</Card>
        ) : (
          <ul className="space-y-4">
            {courses.map((course) => (
              <li key={course.id}>
                <Link to={`/learning/${course.id}`}>
                  <Card className="transition-transform duration-200 ease-ios active:scale-[0.99]">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge tone="primary">{t('common.level', { level: course.level })}</Badge>
                      {course.category && (
                        <span className="text-[12px] text-ink-faint">{course.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-semibold text-ink">{course.title}</p>
                        {course.description && (
                          <p className="mt-1 text-[14px] text-ink-soft">{course.description}</p>
                        )}
                      </div>
                      <ChevronRight size={20} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
