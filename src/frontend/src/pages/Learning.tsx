import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCourses } from '../api/courses';
import { getErrorMessage } from '../api/client';
import type { Course } from '../types';
import Spinner from '../components/Spinner';

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
    <div className="px-5 pt-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{t('learning.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('learning.subtitle')}</p>
      </header>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              level === lv ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {lv === 0 ? t('learning.allLevels') : t('common.level', { level: lv })}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="rounded-xl bg-white p-4 text-sm text-red-500">{error}</p>
      ) : courses.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('learning.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((course) => (
            <li key={course.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                  {t('common.level', { level: course.level })}
                </span>
                {course.category && (
                  <span className="text-xs text-gray-400">{course.category}</span>
                )}
              </div>
              <p className="font-semibold text-gray-900">{course.title}</p>
              {course.description && (
                <p className="mt-1 text-sm text-gray-500">{course.description}</p>
              )}
              <button className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition active:scale-[.99]">
                {t('learning.startCourse')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
