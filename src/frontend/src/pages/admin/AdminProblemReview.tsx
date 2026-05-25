import { useEffect, useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import {
  getPendingProblems,
  approveProblem,
  rejectProblem,
  updateProblem,
} from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { Problem } from '../../types';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/ui/EmptyState';

function validations(p: Problem) {
  return [
    { label: '어법 검증', ok: Boolean(p.detailed_explanation || p.explanation) },
    {
      label: '정답 검증',
      ok: Boolean(p.options && p.correct_answer && p.options.includes(p.correct_answer)),
    },
    { label: '변별력 검증', ok: Boolean(p.options && p.options.length === 4) },
  ];
}

export default function AdminProblemReview() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const [rejecting, setRejecting] = useState<Problem | null>(null);
  const [reason, setReason] = useState('');
  const [editing, setEditing] = useState<Problem | null>(null);
  const [editFields, setEditFields] = useState({ question: '', correct_answer: '', explanation: '' });

  useEffect(() => {
    let active = true;
    getPendingProblems()
      .then((data) => active && setProblems(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function remove(id: string) {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleApprove(p: Problem) {
    setBusyId(p.id);
    try {
      await approveProblem(p.id);
      remove(p.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  async function handleReject() {
    if (!rejecting || !reason.trim()) return;
    setBusyId(rejecting.id);
    try {
      await rejectProblem(rejecting.id, reason.trim());
      remove(rejecting.id);
      setRejecting(null);
      setReason('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  function openEdit(p: Problem) {
    setEditing(p);
    setEditFields({
      question: p.question,
      correct_answer: p.correct_answer ?? '',
      explanation: p.explanation ?? '',
    });
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setBusyId(editing.id);
    try {
      const updated = await updateProblem(editing.id, editFields);
      setProblems((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      setEditing(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-mobile bg-surface-soft">
      <TopBar title="문제 검토" showBack showSearch={false} showBell={false} />
      <div className="px-5 pb-12 pt-2">
        {error && <p className="mb-3 text-[14px] text-error">{error}</p>}

        {loading ? (
          <Spinner />
        ) : problems.length === 0 ? (
          <EmptyState emoji="✅" title="검토할 문제가 없습니다." />
        ) : (
          <ul className="space-y-4">
            {problems.map((p) => (
              <li key={p.id}>
                <Card>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone="neutral">{p.category}</Badge>
                    <Badge tone="yellow">검토 대기</Badge>
                    {p.created_by === 'ai' && <Badge tone="primary">AI 생성</Badge>}
                  </div>

                  <p className="text-[16px] font-semibold text-ink">{p.question}</p>

                  {p.options && (
                    <ul className="mt-2 space-y-1">
                      {p.options.map((o, i) => (
                        <li
                          key={i}
                          className={`text-[14px] ${
                            o === p.correct_answer ? 'font-semibold text-success' : 'text-ink-soft'
                          }`}
                        >
                          {i + 1}. {o}
                          {o === p.correct_answer ? ' ✓' : ''}
                        </li>
                      ))}
                    </ul>
                  )}

                  {p.explanation && (
                    <p className="mt-2 text-[13px] text-ink-soft">{p.explanation}</p>
                  )}

                  <div className="mt-3 rounded-xl bg-surface-muted p-3">
                    <p className="mb-1.5 text-[12px] font-semibold text-ink-soft">AI 검증 결과</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {validations(p).map((v) => (
                        <span
                          key={v.label}
                          className={`flex items-center gap-1 text-[13px] ${
                            v.ok ? 'text-success' : 'text-error'
                          }`}
                        >
                          {v.ok ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
                          {v.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Button
                      variant="primary"
                      disabled={busyId === p.id}
                      onClick={() => handleApprove(p)}
                    >
                      ✅ 승인
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => {
                        setRejecting(p);
                        setReason('');
                      }}
                    >
                      ❌ 거부
                    </Button>
                    <Button variant="secondary" disabled={busyId === p.id} onClick={() => openEdit(p)}>
                      <Pencil size={16} strokeWidth={1.9} /> 수정
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 거부 사유 모달 */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-mobile rounded-card bg-white p-5">
            <h2 className="text-title-m text-ink">거부 사유</h2>
            <p className="mt-1 text-[13px] text-ink-soft">사유는 AI 학습 로그로 저장됩니다.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="예: 보기 ②가 정답과 의미가 중복됩니다."
              className="mt-3 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-primary"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setRejecting(null)}>
                취소
              </Button>
              <Button onClick={handleReject} disabled={!reason.trim() || busyId === rejecting.id}>
                거부 확정
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-mobile rounded-card bg-white p-5">
            <h2 className="text-title-m text-ink">문제 수정</h2>
            <label className="mt-3 block text-[13px] font-medium text-ink-soft">문제</label>
            <textarea
              value={editFields.question}
              onChange={(e) => setEditFields((f) => ({ ...f, question: e.target.value }))}
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-primary"
            />
            <label className="mt-3 block text-[13px] font-medium text-ink-soft">정답</label>
            <input
              value={editFields.correct_answer}
              onChange={(e) => setEditFields((f) => ({ ...f, correct_answer: e.target.value }))}
              className="mt-1 h-[44px] w-full rounded-xl border border-line px-3 text-[15px] outline-none focus:border-primary"
            />
            <label className="mt-3 block text-[13px] font-medium text-ink-soft">해설</label>
            <textarea
              value={editFields.explanation}
              onChange={(e) => setEditFields((f) => ({ ...f, explanation: e.target.value }))}
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-primary"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                취소
              </Button>
              <Button onClick={handleSaveEdit} disabled={busyId === editing.id}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
