import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPost, updatePost, deletePost } from '../api/posts';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';
import Spinner from '../components/Spinner';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getPost(id)
      .then((p) => {
        if (!active) return;
        setPost(p);
        setTitle(p.title);
        setContent(p.content);
      })
      .catch((e) => active && setError(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const isOwner = Boolean(post && user && post.user_id === user.id);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    try {
      const updated = await updatePost(id, { title, content });
      setPost(updated);
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm(t('community.deleteConfirm'))) return;
    setBusy(true);
    try {
      await deletePost(id);
      navigate('/community', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="px-5 pt-6">
      <Link to="/community" className="mb-4 inline-block text-sm font-medium text-primary">
        ← {t('community.back')}
      </Link>

      {error && <p className="mb-3 rounded-xl bg-white p-3 text-sm text-red-500">{error}</p>}

      {!post ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('common.empty')}</p>
      ) : editing ? (
        <form onSubmit={handleUpdate} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? t('common.loading') : t('community.update')}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <article className="rounded-2xl border border-gray-200 bg-white p-5">
          <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
            {t(`community.categoryFilter.${post.category}`, post.category)}
          </span>
          <h1 className="mt-2 text-lg font-bold text-gray-900">{post.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <span>{post.author?.username ?? '익명'}</span>
            <span>·</span>
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {post.content}
          </p>

          {isOwner && (
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded-xl border border-primary py-2.5 text-sm font-semibold text-primary"
              >
                {t('community.edit')}
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="flex-1 rounded-xl border border-red-300 py-2.5 text-sm font-semibold text-red-500 disabled:opacity-60"
              >
                {t('community.delete')}
              </button>
            </div>
          )}
        </article>
      )}
    </div>
  );
}
