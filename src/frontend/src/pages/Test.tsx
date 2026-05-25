import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProblems, submitAnswer } from '../api/problems';
import { getErrorMessage } from '../api/client';
import type { Problem, SubmissionResult } from '../types';
import Spinner from '../components/Spinner';

const CATEGORIES = ['all', 'listening', 'reading', 'grammar', 'vocabulary', 'writing'];

export default function Test() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('all');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setIndex(0);
    setSelected('');
    setResult(null);
    setCorrectCount(0);
    setFinished(false);

    getProblems({ category: category === 'all' ? undefined : category, limit: 10 })
      .then((data) => {
        if (active) setProblems(data);
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
  }, [category]);

  const current = problems[index];

  async function handleSubmit() {
    if (!current || !selected) return;
    setSubmitting(true);
    try {
      const res = await submitAnswer({ problem_id: current.id, answer: selected });
      setResult(res);
      if (res.is_correct) setCorrectCount((c) => c + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (index + 1 >= problems.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected('');
      setResult(null);
    }
  }

  function restart() {
    setIndex(0);
    setSelected('');
    setResult(null);
    setCorrectCount(0);
    setFinished(false);
  }

  return (
    <div className="px-5 pt-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{t('test.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('test.subtitle')}</p>
      </header>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === cat
                ? 'bg-primary text-white'
                : 'border border-gray-200 bg-white text-gray-500'
            }`}
          >
            {t(`test.category.${cat}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="rounded-xl bg-white p-4 text-sm text-red-500">{error}</p>
      ) : problems.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('test.empty')}</p>
      ) : finished ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-4xl">🏆</p>
          <h2 className="mt-3 text-lg font-bold text-gray-900">{t('test.result')}</h2>
          <p className="mt-2 text-gray-700">
            {t('test.scoreSummary', { total: problems.length, correct: correctCount })}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t('test.accuracy', {
              accuracy: Math.round((correctCount / problems.length) * 100),
            })}
          </p>
          <button
            onClick={restart}
            className="mt-5 w-full rounded-xl bg-primary py-3 font-semibold text-white transition active:scale-[.99]"
          >
            {t('test.restart')}
          </button>
        </div>
      ) : current ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="mb-3 text-xs font-medium text-primary">
            {t('test.question', { current: index + 1, total: problems.length })}
          </p>
          <p className="mb-5 text-base font-semibold leading-relaxed text-gray-900">
            {current.question}
          </p>

          {current.options && current.options.length > 0 ? (
            <div className="space-y-2">
              {current.options.map((option, i) => {
                const isPicked = selected === option;
                const showCorrect = result && option === result.correct_answer;
                const showWrong = result && isPicked && !result.is_correct;
                return (
                  <button
                    key={i}
                    disabled={Boolean(result)}
                    onClick={() => setSelected(option)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                      showCorrect
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : showWrong
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : isPicked
                            ? 'border-primary bg-primary-50 text-primary'
                            : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={Boolean(result)}
              placeholder={t('test.start')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}

          {result && (
            <div
              className={`mt-4 rounded-xl p-3 text-sm ${
                result.is_correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              <p className="font-semibold">
                {result.is_correct ? t('test.correct') : t('test.incorrect')}
              </p>
              {!result.is_correct && (
                <p className="mt-1">{t('test.correctAnswer', { answer: result.correct_answer })}</p>
              )}
              {result.explanation && <p className="mt-1 text-gray-600">{result.explanation}</p>}
            </div>
          )}

          {result ? (
            <button
              onClick={handleNext}
              className="mt-5 w-full rounded-xl bg-primary py-3 font-semibold text-white transition active:scale-[.99]"
            >
              {index + 1 >= problems.length ? t('test.finish') : t('test.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="mt-5 w-full rounded-xl bg-primary py-3 font-semibold text-white transition active:scale-[.99] disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('common.submit')}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
