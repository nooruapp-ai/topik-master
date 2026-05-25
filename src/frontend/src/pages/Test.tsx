import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { getProblems, submitAnswer } from '../api/problems';
import { getErrorMessage } from '../api/client';
import type { Problem, SubmissionResult } from '../types';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
    <div>
      <TopBar title={t('test.title')} />
      <div className="px-5 pt-2">
        <p className="mb-4 text-[14px] text-ink-soft">{t('test.subtitle')}</p>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-200 ${
                category === cat ? 'bg-primary text-white' : 'border border-line bg-white text-ink-soft'
              }`}
            >
              {t(`test.category.${cat}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : problems.length === 0 ? (
          <Card className="text-[14px] text-ink-faint">{t('test.empty')}</Card>
        ) : finished ? (
          <Card className="text-center">
            <p className="text-5xl">🏆</p>
            <h2 className="mt-3 text-title-m text-ink">{t('test.result')}</h2>
            <p className="mt-2 text-[15px] text-ink-soft">
              {t('test.scoreSummary', { total: problems.length, correct: correctCount })}
            </p>
            <p className="mt-1 text-[14px] text-ink-faint">
              {t('test.accuracy', { accuracy: Math.round((correctCount / problems.length) * 100) })}
            </p>
            <Button onClick={restart} className="mt-6">
              {t('test.restart')}
            </Button>
          </Card>
        ) : current ? (
          <Card>
            <p className="mb-2 text-[12px] font-semibold text-primary">
              {t('test.question', { current: index + 1, total: problems.length })}
            </p>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-ios"
                style={{ width: `${((index + 1) / problems.length) * 100}%` }}
              />
            </div>
            <p className="mb-5 text-[18px] font-semibold leading-relaxed text-ink">
              {current.question}
            </p>

            {current.options && current.options.length > 0 ? (
              <div className="space-y-2.5">
                {current.options.map((option, i) => {
                  const isPicked = selected === option;
                  const showCorrect = result && option === result.correct_answer;
                  const showWrong = result && isPicked && !result.is_correct;
                  return (
                    <button
                      key={i}
                      disabled={Boolean(result)}
                      onClick={() => setSelected(option)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors duration-200 ${
                        showCorrect
                          ? 'border-success bg-success/10 text-success'
                          : showWrong
                            ? 'border-error bg-error/10 text-error'
                            : isPicked
                              ? 'border-primary bg-primary-light text-primary'
                              : 'border-line text-ink'
                      }`}
                    >
                      <span>{option}</span>
                      {showCorrect && <Check size={18} strokeWidth={2} />}
                      {showWrong && <X size={18} strokeWidth={2} />}
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
                className="h-[52px] w-full rounded-xl border border-line px-4 text-[16px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            )}

            {result && (
              <div
                className={`mt-4 rounded-xl p-4 text-[14px] ${
                  result.is_correct ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}
              >
                <p className="font-semibold">
                  {result.is_correct ? t('test.correct') : t('test.incorrect')}
                </p>
                {!result.is_correct && (
                  <p className="mt-1">{t('test.correctAnswer', { answer: result.correct_answer })}</p>
                )}
                {result.explanation && <p className="mt-1 text-ink-soft">{result.explanation}</p>}
              </div>
            )}

            {result ? (
              <Button onClick={handleNext} className="mt-6">
                {index + 1 >= problems.length ? t('test.finish') : t('test.next')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!selected || submitting} className="mt-6">
                {submitting ? t('common.loading') : t('common.submit')}
              </Button>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
