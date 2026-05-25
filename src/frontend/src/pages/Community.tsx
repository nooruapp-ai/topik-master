import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getPosts, createPost } from '../api/posts';
import { getErrorMessage } from '../api/client';
import type { Post } from '../types';
import Spinner from '../components/Spinner';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function Community() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadPosts() {
    setLoading(true);
    setError('');
    getPosts()
      .then(setPosts)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadPosts, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const post = await createPost({ title, content });
      setPosts((prev) => [post, ...prev]);
      setTitle('');
      setContent('');
      setWriting(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 pt-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('community.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('community.subtitle')}</p>
        </div>
        <button
          onClick={() => setWriting((w) => !w)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {t('community.write')}
        </button>
      </header>

      {writing && (
        <form
          onSubmit={handleCreate}
          className="mb-5 space-y-3 rounded-2xl border border-gray-200 bg-white p-4"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('community.postTitlePlaceholder')}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('community.postContentPlaceholder')}
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? t('common.loading') : t('community.publish')}
          </button>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="rounded-xl bg-white p-4 text-sm text-red-500">{error}</p>
      ) : posts.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-400">{t('community.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="font-semibold text-gray-900">{post.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.content}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span>{post.author?.username ?? '익명'}</span>
                <span>·</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
