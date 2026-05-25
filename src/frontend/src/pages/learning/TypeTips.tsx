import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lightbulb, AlertTriangle, Quote } from 'lucide-react';
import { getProblemType } from '../../api/problemTypes';
import { getErrorMessage } from '../../api/client';
import type { ProblemType } from '../../types';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/Spinner';

export default function TypeTips() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { level = '', category = '', typeId = '' } = useParams();

  const [type, setType] = useState<ProblemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProblemType(typeId)
      .then((data) => active && setType(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [typeId]);

  function startSolve() {
    // 꿀팁 학습을 마쳐야 문제 풀이로 진입할 수 있습니다.
    navigate(`/learning/${level}/${category}/${typeId}/solve`, { state: { tipsCompleted: true } });
  }

  return (
    <div>
      <TopBar title={type?.type_name ?? ''} showBack showSearch={false} showBell={false} />
      <div className="px-5 pb-4 pt-2">
        {loading ? (
          <Spinner />
        ) : error || !type ? (
          <Card className="text-[14px] text-error">{error || t('common.error')}</Card>
        ) : (
          <>
            {type.description && (
              <p className="mb-6 text-[15px] leading-relaxed text-ink-soft">{type.description}</p>
            )}

            <div className="mb-6 flex items-center gap-2">
              <Lightbulb size={20} strokeWidth={1.9} className="text-primary" />
              <h2 className="text-title-m text-ink">{t('learn.tips')}</h2>
            </div>
            <ul className="space-y-3">
              {type.tips.map((tip, i) => (
                <li key={i}>
                  <Card className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-white">
                      {i + 1}
                    </div>
                    <p className="flex-1 text-[15px] leading-relaxed text-ink">{tip}</p>
                  </Card>
                </li>
              ))}
            </ul>

            {type.warnings.length > 0 && (
              <>
                <div className="mb-3 mt-8 flex items-center gap-2">
                  <AlertTriangle size={20} strokeWidth={1.9} className="text-error" />
                  <h2 className="text-title-m text-ink">{t('learn.warnings')}</h2>
                </div>
                <Card className="space-y-2.5 border-error/20 bg-error/5">
                  {type.warnings.map((w, i) => (
                    <p key={i} className="text-[14px] leading-relaxed text-ink">
                      • {w}
                    </p>
                  ))}
                </Card>
              </>
            )}

            {type.real_review && (
              <>
                <div className="mb-3 mt-8 flex items-center gap-2">
                  <Quote size={20} strokeWidth={1.9} className="text-success" />
                  <h2 className="text-title-m text-ink">{t('learn.review')}</h2>
                </div>
                <Card className="border-success/20 bg-success/5">
                  <p className="text-[15px] leading-relaxed text-ink">{type.real_review}</p>
                </Card>
              </>
            )}

            <Button onClick={startSolve} className="mt-8">
              {t('learn.startSolve')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
