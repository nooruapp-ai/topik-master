import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getProblemStats, type AdminStats } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getProblemStats()
      .then((data) => active && setStats(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const cards = stats
    ? [
        { label: '전체 문제', value: stats.total, tone: 'text-ink' },
        { label: '검토 대기', value: stats.pending, tone: 'text-warning' },
        { label: '승인됨', value: stats.approved, tone: 'text-success' },
        { label: '거부됨', value: stats.rejected, tone: 'text-error' },
        { label: 'AI 생성', value: stats.ai_generated, tone: 'text-primary' },
      ]
    : [];

  return (
    <div className="mx-auto min-h-screen max-w-mobile bg-surface-soft">
      <TopBar title="관리자 대시보드" showBack showSearch={false} showBell={false} />
      <div className="px-5 pb-12 pt-2">
        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              {cards.map((c) => (
                <Card key={c.label}>
                  <p className="text-[14px] text-ink-soft">{c.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${c.tone}`}>{c.value.toLocaleString()}</p>
                </Card>
              ))}
            </div>

            <button onClick={() => navigate('/admin/review')} className="mt-6 w-full text-left">
              <Card className="flex items-center gap-3 transition-transform duration-200 ease-ios active:scale-[0.99]">
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold text-ink">검토 대기 문제</p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    {stats.pending}건의 문제가 검토를 기다리고 있어요.
                  </p>
                </div>
                <ChevronRight size={20} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
              </Card>
            </button>

            <Button onClick={() => navigate('/admin/review')} className="mt-6">
              검토 시작하기
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
