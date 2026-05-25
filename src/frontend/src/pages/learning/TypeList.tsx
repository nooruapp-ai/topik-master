import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProblemTypes } from '../../api/problemTypes';
import { getErrorMessage } from '../../api/client';
import type { ProblemType } from '../../types';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/ui/EmptyState';

function Stars({ value }: { value: number }) {
  const v = Math.max(1, Math.min(5, value));
  return (
    <span className="text-[13px] tracking-tight text-warning" aria-label={`난이도 ${v}/5`}>
      {'★'.repeat(v)}
      <span className="text-line">{'★'.repeat(5 - v)}</span>
    </span>
  );
}

export default function TypeList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { level = '', category = '' } = useParams();

  const [types, setTypes] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProblemTypes({ level, category })
      .then((data) => active && setTypes(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [level, category]);

  return (
    <div>
      <TopBar title={t(`test.category.${category}`, category)} showBack showSearch={false} showBell={false} />
      <div className="px-5 pt-2">
        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : types.length === 0 ? (
          <EmptyState title={t('learn.noTypes')} />
        ) : (
          <ul className="space-y-4">
            {types.map((tp) => (
              <li key={tp.id}>
                <Card>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone="primary">{`유형 ${tp.type_number}`}</Badge>
                    {tp.question_numbers && (
                      <span className="text-[12px] text-ink-faint">{tp.question_numbers}</span>
                    )}
                  </div>
                  <p className="text-[16px] font-semibold text-ink">{tp.type_name}</p>
                  {tp.description && (
                    <p className="mt-1 line-clamp-2 text-[14px] text-ink-soft">{tp.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <Stars value={tp.difficulty} />
                    {typeof tp.avg_accuracy === 'number' && (
                      <span className="text-[12px] text-ink-faint">
                        {t('learn.avgAccuracy', { rate: tp.avg_accuracy })}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => navigate(`/learning/${level}/${category}/${tp.id}`)}
                    className="mt-4"
                  >
                    {t('learn.start')}
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
