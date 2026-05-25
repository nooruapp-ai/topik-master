import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Headphones,
  BookOpen,
  PenLine,
  Languages,
  Type,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { getProblemTypes } from '../../api/problemTypes';
import { getErrorMessage } from '../../api/client';
import type { ProblemType } from '../../types';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORY_META: Record<string, { icon: LucideIcon; chip: string; color: string }> = {
  listening: { icon: Headphones, chip: 'bg-primary-light', color: 'text-primary' },
  reading: { icon: BookOpen, chip: 'bg-accent-mint/40', color: 'text-[#1F8A60]' },
  grammar: { icon: Languages, chip: 'bg-accent-yellow/50', color: 'text-[#B5860B]' },
  writing: { icon: PenLine, chip: 'bg-accent-coral/30', color: 'text-[#D9534F]' },
  vocabulary: { icon: Type, chip: 'bg-primary-light', color: 'text-primary' },
};
const ORDER = ['listening', 'reading', 'grammar', 'writing', 'vocabulary'];

export default function CategorySelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { level = '' } = useParams();

  const [types, setTypes] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProblemTypes({ level })
      .then((data) => active && setTypes(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [level]);

  // 영역별 유형 개수 집계 후 정해진 순서로 정렬
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tp of types) counts.set(tp.category, (counts.get(tp.category) ?? 0) + 1);
    return ORDER.filter((c) => counts.has(c)).map((c) => ({ code: c, count: counts.get(c) ?? 0 }));
  }, [types]);

  return (
    <div>
      <TopBar title={t(`learn.levelTitle.${level}`, level)} showBack showSearch={false} showBell={false} />
      <div className="px-5 pt-2">
        <p className="mb-5 text-[14px] text-ink-soft">{t('learn.selectCategory')}</p>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : categories.length === 0 ? (
          <EmptyState title={t('learn.noTypes')} />
        ) : (
          <ul className="space-y-4">
            {categories.map(({ code, count }) => {
              const meta = CATEGORY_META[code] ?? CATEGORY_META.reading;
              const Icon = meta.icon;
              return (
                <li key={code}>
                  <button
                    onClick={() => navigate(`/learning/${level}/${code}`)}
                    className="w-full text-left"
                  >
                    <Card className="flex items-center gap-4 transition-transform duration-200 ease-ios active:scale-[0.99]">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.chip} ${meta.color}`}
                      >
                        <Icon size={22} strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-semibold text-ink">
                          {t(`test.category.${code}`, code)}
                        </p>
                        <p className="mt-0.5 text-[13px] text-ink-soft">
                          {t('learn.typeCount', { count })}
                        </p>
                      </div>
                      <ChevronRight size={20} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
                    </Card>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
