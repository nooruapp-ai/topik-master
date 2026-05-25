import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Bot } from 'lucide-react';
import { getProblemStats, generateProblems, type AdminStats } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/Spinner';

const GEN_LEVELS = [
  { value: 'topik1', label: 'TOPIK I' },
  { value: 'topik2_mid', label: 'TOPIK II 중급' },
  { value: 'topik2_high', label: 'TOPIK II 고급' },
];
const GEN_CATEGORIES = ['grammar', 'vocabulary', 'reading', 'listening', 'writing'];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [genLevel, setGenLevel] = useState('topik1');
  const [genCategory, setGenCategory] = useState('grammar');
  const [genCount, setGenCount] = useState(5);
  const [genBusy, setGenBusy] = useState(false);
  const [genMsg, setGenMsg] = useState('');

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

  async function handleGenerate() {
    setGenBusy(true);
    setGenMsg('');
    try {
      const { created } = await generateProblems({
        level: genLevel,
        category: genCategory,
        count: genCount,
      });
      setGenMsg(`${created}개 문제가 생성되어 검토 대기에 추가되었습니다.`);
      try {
        setStats(await getProblemStats());
      } catch {
        /* 통계 갱신 실패는 무시 */
      }
    } catch (err) {
      setGenMsg(getErrorMessage(err));
    } finally {
      setGenBusy(false);
    }
  }

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

            {/* AI 문제 생성 */}
            <div className="mb-2 mt-8 flex items-center gap-2">
              <Bot size={20} strokeWidth={1.9} className="text-primary" />
              <h2 className="text-title-m text-ink">AI 문제 생성</h2>
            </div>
            <Card className="space-y-3">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-ink-soft">레벨</label>
                <select
                  value={genLevel}
                  onChange={(e) => setGenLevel(e.target.value)}
                  className="h-[44px] w-full rounded-xl border border-line bg-white px-3 text-[15px] outline-none focus:border-primary"
                >
                  {GEN_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-ink-soft">영역</label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="h-[44px] w-full rounded-xl border border-line bg-white px-3 text-[15px] outline-none focus:border-primary"
                >
                  {GEN_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`test.category.${c}`, c)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-ink-soft">생성 개수</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="h-[44px] w-full rounded-xl border border-line bg-white px-3 text-[15px] outline-none focus:border-primary"
                />
              </div>
              {genMsg && <p className="text-[13px] text-primary">{genMsg}</p>}
              <Button onClick={handleGenerate} disabled={genBusy}>
                {genBusy ? '생성 중...' : '생성하기'}
              </Button>
            </Card>

            <Button onClick={() => navigate('/admin/review')} className="mt-6">
              검토 시작하기
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
