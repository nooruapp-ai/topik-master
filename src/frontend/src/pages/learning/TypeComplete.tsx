import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface CompleteState {
  total: number;
  correct: number;
  avgSec: number;
  learned: string[];
}

export default function TypeComplete() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { level = '', category = '', typeId = '' } = useParams();

  const state = location.state as CompleteState | null;

  // 직접 접근(요약 데이터 없음) 시 유형 목록으로 되돌립니다.
  useEffect(() => {
    if (!state) navigate(`/learning/${level}/${category}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  const accuracy = state.total ? Math.round((state.correct / state.total) * 100) : 0;

  return (
    <div>
      <TopBar showBack={false} showSearch={false} showBell={false} />
      <div className="px-5 pb-4 pt-2">
        <Card className="items-center text-center">
          <div className="flex flex-col items-center">
            <CheckCircle2 size={56} strokeWidth={1.5} className="text-success" />
            <h1 className="mt-3 text-title-l text-ink">{t('learn.complete')}</h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              {t('test.scoreSummary', { total: state.total, correct: state.correct })}
            </p>
          </div>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-muted p-4">
              <p className="text-[13px] text-ink-soft">{t('learn.accuracy')}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{accuracy}%</p>
            </div>
            <div className="rounded-xl bg-surface-muted p-4">
              <p className="text-[13px] text-ink-soft">{t('learn.avgTime')}</p>
              <p className="mt-1 text-2xl font-bold text-ink">
                {t('learn.seconds', { sec: state.avgSec })}
              </p>
            </div>
          </div>
        </Card>

        {state.learned.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-title-m text-ink">{t('learn.keyPoints')}</h2>
            <ul className="space-y-2.5">
              {state.learned.map((point, i) => (
                <li key={i}>
                  <Card padded={false} className="flex items-center gap-3 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-[14px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-[14px] leading-relaxed text-ink">{point}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-8 space-y-3">
          <Button onClick={() => navigate(`/learning/${level}/${category}`)}>
            {t('learn.nextType')}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/learning/${level}/${category}/${typeId}`, { replace: true })
            }
          >
            {t('learn.reviewAgain')}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            {t('learn.home')}
          </Button>
        </div>
      </div>
    </div>
  );
}
