import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPosts, createPost } from '../api/posts';
import { getErrorMessage } from '../api/client';
import type { Post } from '../types';
import Spinner from '../components/Spinner';

const FILTERS = ['all', 'free', 'question', 'tip'];
const WRITE_CATEGORIES = ['free', 'question', 'tip'];

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
  const [filter, setFilter] = useState('all');

  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getPosts(filter === 'all' ? undefined : filter)
      .then((data) => active && setPosts(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filter]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const post = await createPost({ title, content, category });
      if (filter === 'all' || filter === category) {
        setPosts((prev) => [post, ...prev]);
      }
      setTitle('');
      setContent('');
      setCategory('free');
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

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-500'
            }`}
          >
            {t(`community.categoryFilter.${f}`)}
          </button>
        ))}
      </div>

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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {WRITE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`community.categoryFilter.${c}`)}
              </option>
            ))}
          </select>
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
            <li key={post.id}>
              <Link
                to={`/community/${post.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-4 transition active:scale-[.99]"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {t(`community.categoryFilter.${post.category}`, post.category)}
                  </span>
                </div>
                <p className="font-semibold text-gray-900">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.content}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.author?.username ?? '익명'}</span>
                  <span>·</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
