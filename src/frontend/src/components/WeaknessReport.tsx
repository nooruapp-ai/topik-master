import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, TrendingUp, Target } from 'lucide-react';
import { getDashboard, type Weaknesses, type Recommendations } from '../api/analytics';
import { getErrorMessage } from '../api/client';
import Spinner from './Spinner';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

export default function WeaknessReport({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [weak, setWeak] = useState<Weaknesses | null>(null);
  const [rec, setRec] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDashboard(userId)
      .then((d) => {
        if (!active) return;
        setWeak(d.weaknesses);
        setRec(d.recommendations);
      })
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <Card className="text-[14px] text-error">{error}</Card>;
  if (!weak) return null;

  const hasData =
    weak.weak_grammar.length +
      weak.weak_vocabulary.length +
      weak.weak_categories.length >
    0;

  if (!hasData) {
    return <EmptyState emoji="📊" title="아직 분석할 데이터가 없어요. 문제를 풀어보세요!" />;
  }

  const catLabel = (c: string) => t(`test.category.${c}`, c);
  const chartData = weak.weak_categories.map((c) => ({ name: catLabel(c.category), 정답률: c.accuracy }));
  const weakTags = [...weak.weak_grammar, ...weak.weak_vocabulary].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 추천 학습 */}
      {rec && rec.weak_category && (
        <Card className="border-primary/30 bg-primary-light">
          <div className="mb-1 flex items-center gap-1.5">
            <Target size={18} strokeWidth={2} className="text-primary" />
            <p className="text-[14px] font-bold text-primary">추천 학습</p>
          </div>
          <p className="text-[15px] text-primary-dark">
            {catLabel(rec.weak_category)} 영역이 약해요. 집중 보충 학습을 추천합니다!
          </p>
          <Button onClick={() => navigate('/learning')} className="mt-3">
            약점 보충 학습 시작 ({rec.problems.length}문제)
          </Button>
        </Card>
      )}

      {/* 약점 영역 */}
      {weakTags.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown size={18} strokeWidth={2} className="text-error" />
            <h3 className="text-title-m text-ink">약점 영역</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakTags.map((tg) => (
              <Badge key={tg.tag} tone="coral">
                {tg.tag} {tg.wrong}회 틀림
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 강점 영역 */}
      {weak.strong_areas.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={18} strokeWidth={2} className="text-success" />
            <h3 className="text-title-m text-ink">강점 영역</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {weak.strong_areas.map((c) => (
              <Badge key={c.category} tone="mint">
                {catLabel(c.category)} {c.accuracy}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 영역별 정답률 차트 */}
      {chartData.length > 0 && (
        <div>
          <h3 className="mb-3 text-title-m text-ink">영역별 정답률</h3>
          <Card>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip />
                <Bar dataKey="정답률" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
