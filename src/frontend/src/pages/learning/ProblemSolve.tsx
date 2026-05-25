import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X, Lightbulb, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';
import { getProblems, submitAnswer } from '../../api/problems';
import { getProblemType } from '../../api/problemTypes';
import { getErrorMessage } from '../../api/client';
import type { Problem, ProblemType, SubmissionResult } from '../../types';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ProblemSolve() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { level = '', category = '', typeId = '' } = useParams();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [type, setType] = useState<ProblemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const startRef = useRef(Date.now());
  const timesRef = useRef<number[]>([]);
  const learnedRef = useRef<string[]>([]);

  // 꿀팁 학습(TypeTips)을 거치지 않으면 진입 차단 — 직접 URL 접근 방지
  useEffect(() => {
    const state = location.state as { tipsCompleted?: boolean } | null;
    if (!state?.tipsCompleted) {
      navigate(`/learning/${level}/${category}/${typeId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([getProblems({ type_id: typeId, limit: 10 }), getProblemType(typeId)])
      .then(async ([probs, tp]) => {
        if (!active) return;
        // 폴백: 이 유형에 연결된 문제가 0건이면 같은 category 문제로 재시도
        const list = probs.length === 0 && category ? await getProblems({ category, limit: 10 }) : probs;
        if (!active) return;
        setProblems(list);
        setType(tp);
        startRef.current = Date.now();
      })
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [typeId]);

  const current = problems[index];

  async function handleSubmit() {
    if (!current || !selected) return;
    setSubmitting(true);
    try {
      const res = await submitAnswer({ problem_id: current.id, answer: selected });
      setResult(res);
      timesRef.current.push(Date.now() - startRef.current);
      if (res.is_correct) setCorrectCount((c) => c + 1);
      if (current.learning_point) learnedRef.current.push(current.learning_point);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (index + 1 >= problems.length) {
      const times = timesRef.current;
      const avgSec = times.length
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 1000)
        : 0;
      const learned = Array.from(new Set(learnedRef.current)).slice(0, 3);
      navigate(`/learning/${level}/${category}/${typeId}/complete`, {
        state: { total: problems.length, correct: correctCount, avgSec, learned },
      });
    } else {
      setIndex((i) => i + 1);
      setSelected('');
      setResult(null);
      setShowHint(false);
      startRef.current = Date.now();
    }
  }

  if (loading) return <Spinner fullScreen />;

  return (
    <div>
      <TopBar title={type?.type_name ?? ''} showBack showSearch={false} showBell={false} />
      <div className="px-5 pb-4 pt-2">
        {error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : problems.length === 0 ? (
          <EmptyState
            emoji="🛠️"
            title={t('learn.noProblems')}
            action={<Button onClick={() => navigate(`/learning/${level}/${category}`)}>{t('learn.nextType')}</Button>}
          />
        ) : current ? (
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[12px] font-semibold text-primary">
                {t('test.question', { current: index + 1, total: problems.length })}
              </p>
              {current.hint && !result && (
                <button
                  onClick={() => setShowHint((v) => !v)}
                  className="flex items-center gap-1 text-[13px] font-medium text-primary"
                >
                  <Lightbulb size={16} strokeWidth={1.9} />
                  {t('learn.hint')}
                </button>
              )}
            </div>

            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-ios"
                style={{ width: `${((index + 1) / problems.length) * 100}%` }}
              />
            </div>

            <p className="mb-4 text-[18px] font-semibold leading-relaxed text-ink">
              {current.question}
            </p>

            {showHint && current.hint && !result && (
              <div className="mb-4 flex gap-2 rounded-xl bg-primary-light p-3.5">
                <Lightbulb size={18} strokeWidth={1.9} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-[14px] leading-relaxed text-primary">{current.hint}</p>
              </div>
            )}

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
                className="h-[52px] w-full rounded-xl border border-line px-4 text-[16px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            )}

            {result && (
              <div className="mt-5 space-y-4">
                <div
                  className={`rounded-xl p-4 text-[14px] ${
                    result.is_correct ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}
                >
                  <p className="font-semibold">
                    {result.is_correct ? t('test.correct') : t('test.incorrect')}
                  </p>
                  {!result.is_correct && (
                    <p className="mt-1">{t('test.correctAnswer', { answer: result.correct_answer })}</p>
                  )}
                </div>

                {(current.detailed_explanation || result.explanation) && (
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <BookOpen size={16} strokeWidth={1.9} className="text-ink-soft" />
                      <p className="text-[13px] font-semibold text-ink-soft">
                        {t('learn.detailedExplanation')}
                      </p>
                    </div>
                    <p className="text-[14px] leading-relaxed text-ink">
                      {current.detailed_explanation || result.explanation}
                    </p>
                  </div>
                )}

                {current.wrong_answer_analysis && current.wrong_answer_analysis.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[13px] font-semibold text-ink-soft">
                      {t('learn.wrongAnalysis')}
                    </p>
                    <ul className="space-y-1.5">
                      {current.wrong_answer_analysis.map((a, i) => (
                        <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                          <span className="font-semibold text-ink-faint">{i + 1}.</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {current.learning_point && (
                  <div className="rounded-xl bg-surface-muted p-3.5">
                    <p className="text-[13px] font-semibold text-ink-soft">
                      {t('learn.learningPoint')}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink">
                      {current.learning_point}
                    </p>
                  </div>
                )}

                {current.review_tip && (
                  <div className="rounded-xl border border-primary/30 bg-primary-light p-4">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Sparkles size={16} strokeWidth={2} className="text-primary" />
                      <p className="text-[13px] font-bold text-primary">{t('learn.reviewTip')}</p>
                    </div>
                    <p className="text-[14px] font-medium leading-relaxed text-primary-dark">
                      {current.review_tip}
                    </p>
                  </div>
                )}

                {type?.warnings?.[0] && (
                  <div className="flex gap-2 text-[13px] leading-relaxed text-ink-faint">
                    <AlertTriangle size={15} strokeWidth={1.9} className="mt-0.5 shrink-0" />
                    <span>
                      {t('learn.watchOut')}: {type.warnings[0]}
                    </span>
                  </div>
                )}
              </div>
            )}

            {result ? (
              <Button onClick={handleNext} className="mt-6">
                {index + 1 >= problems.length ? t('learn.seeResult') : t('learn.next')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!selected || submitting} className="mt-6">
                {submitting ? t('common.loading') : t('learn.submit')}
              </Button>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
