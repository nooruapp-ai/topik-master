import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCourse } from '../api/courses';
import { getCourseProgress, saveLessonProgress } from '../api/progress';
import { getErrorMessage } from '../api/client';
import type { Course, Lesson } from '../types';
import Spinner from '../components/Spinner';
import BookmarkButton from '../components/ui/BookmarkButton';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [course, setCourse] = useState<Course | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.allSettled([getCourse(id), getCourseProgress(id)]).then((results) => {
      if (!active) return;
      const [courseR, progR] = results;
      if (courseR.status === 'fulfilled') setCourse(courseR.value);
      else setError(getErrorMessage(courseR.reason));
      if (progR.status === 'fulfilled') {
        setCompleted(
          new Set(
            progR.value
              .filter((p) => p.status === 'completed' && p.lesson_id)
              .map((p) => p.lesson_id as string)
          )
        );
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const lessons = course?.lessons ?? [];
  const percent = lessons.length ? Math.round((completed.size / lessons.length) * 100) : 0;

  async function openLesson(lesson: Lesson) {
    setSelected(lesson);
    if (!id || completed.has(lesson.id)) return;
    try {
      await saveLessonProgress(id, lesson.id);
      setCompleted((prev) => new Set(prev).add(lesson.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="px-5 pt-6">
      <Link to="/learning" className="mb-4 inline-block text-sm font-medium text-primary">
        ← {t('learning.back')}
      </Link>

      {error && <p className="mb-3 rounded-xl bg-white p-3 text-sm text-red-500">{error}</p>}

      {!course ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('common.empty')}</p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
            <BookmarkButton type="course" id={course.id} />
          </div>
          {course.description && <p className="mt-1 text-sm text-gray-500">{course.description}</p>}

          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{t('learning.progress')}</span>
              <span className="font-bold text-primary">{percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <h2 className="mb-2 mt-6 text-base font-bold text-gray-900">{t('learning.lessonList')}</h2>
          {lessons.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('common.empty')}</p>
          ) : (
            <ul className="space-y-2">
              {lessons.map((lesson) => {
                const done = completed.has(lesson.id);
                const active = selected?.id === lesson.id;
                return (
                  <li key={lesson.id}>
                    <button
                      onClick={() => openLesson(lesson)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        active ? 'border-primary bg-primary-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {done ? '✓' : lesson.order_index}
                      </span>
                      <span className="font-medium text-gray-900">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {selected && (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900">{selected.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {selected.content || t('common.empty')}
              </p>
              <p className="mt-3 text-xs font-medium text-primary">✓ {t('learning.completed')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
