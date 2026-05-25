import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    { key: 'checkGrammar', ok: Boolean(p.detailed_explanation || p.explanation) },
    {
      key: 'checkAnswer',
      ok: Boolean(p.options && p.correct_answer && p.options.includes(p.correct_answer)),
    },
    { key: 'checkDiscrimination', ok: Boolean(p.options && p.options.length === 4) },
  ];
}

export default function AdminProblemReview() {
  const { t } = useTranslation();
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
      <TopBar title={t('admin.reviewTitle')} showBack showSearch={false} showBell={false} />
      <div className="px-5 pb-12 pt-2">
        {error && <p className="mb-3 text-[14px] text-error">{error}</p>}

        {loading ? (
          <Spinner />
        ) : problems.length === 0 ? (
          <EmptyState emoji="✅" title={t('admin.noPending')} />
        ) : (
          <ul className="space-y-4">
            {problems.map((p) => (
              <li key={p.id}>
                <Card>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone="neutral">{t(`test.category.${p.category}`, p.category)}</Badge>
                    <Badge tone="yellow">{t('admin.badgePending')}</Badge>
                    {p.created_by === 'ai' && <Badge tone="primary">{t('admin.badgeAi')}</Badge>}
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
                    <p className="mb-1.5 text-[12px] font-semibold text-ink-soft">
                      {t('admin.aiResult')}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {validations(p).map((v) => (
                        <span
                          key={v.key}
                          className={`flex items-center gap-1 text-[13px] ${
                            v.ok ? 'text-success' : 'text-error'
                          }`}
                        >
                          {v.ok ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
                          {t(`admin.${v.key}`)}
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
                      ✅ {t('admin.approve')}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => {
                        setRejecting(p);
                        setReason('');
                      }}
                    >
                      ❌ {t('admin.reject')}
                    </Button>
                    <Button variant="secondary" disabled={busyId === p.id} onClick={() => openEdit(p)}>
                      <Pencil size={16} strokeWidth={1.9} /> {t('admin.edit')}
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
            <h2 className="text-title-m text-ink">{t('admin.rejectReason')}</h2>
            <p className="mt-1 text-[13px] text-ink-soft">{t('admin.rejectReasonDesc')}</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={t('admin.rejectPlaceholder')}
              className="mt-3 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-primary"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setRejecting(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleReject} disabled={!reason.trim() || busyId === rejecting.id}>
                {t('admin.rejectConfirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-mobile rounded-card bg-white p-5">
            <h2 className="text-title-m text-ink">{t('admin.editProblem')}</h2>
            <label className="mt-3 block text-[13px] font-medium text-ink-soft">
              {t('admin.fieldQuestion')}
            </label>
            <textarea
              value={editFields.question}
              onChange={(e) => setEditFields((f) => ({ ...f, question: e.target.value }))}
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-primary"
            />
            <label className="mt-3 block text-[13px] font-medium text-ink-soft">
              {t('admin.fieldAnswer')}
            </label>
            <input
              value={editFields.correct_answer}
              onChange={(e) => setEditFields((f) => ({ ...f, correct_answer: e.target.value }))}
              className="mt-1 h-[44px] w-full rounded-xl border border-line px-3 text-[15px] outline-none focus:border-primary"
            />
            <label className="mt-3 block text-[13px] font-medium text-ink-soft">
              {t('admin.fieldExplanation')}
            </label>
            <textarea
              value={editFields.explanation}
              onChange={(e) => setEditFields((f) => ({ ...f, explanation: e.target.value }))}
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-primary"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveEdit} disabled={busyId === editing.id}>
                {t('admin.save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
