import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { getPosts, createPost } from '../api/posts';
import { getErrorMessage } from '../api/client';
import type { Post } from '../types';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

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
    <div>
      <TopBar
        title={t('community.title')}
        right={
          <button
            onClick={() => setWriting((w) => !w)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-transform duration-200 ease-ios active:scale-[0.95]"
            aria-label={t('community.write')}
          >
            <Plus size={20} strokeWidth={2} />
          </button>
        }
      />
      <div className="px-5 pt-2">
        <p className="mb-4 text-[14px] text-ink-soft">{t('community.subtitle')}</p>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-200 ${
                filter === f ? 'bg-primary text-white' : 'border border-line bg-white text-ink-soft'
              }`}
            >
              {t(`community.categoryFilter.${f}`)}
            </button>
          ))}
        </div>

        {writing && (
          <Card className="mb-5">
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('community.postTitlePlaceholder')}
                className="h-[48px] w-full rounded-xl border border-line px-3 text-[15px] outline-none focus:border-primary"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('community.postContentPlaceholder')}
                rows={4}
                className="w-full resize-none rounded-xl border border-line px-3 py-2.5 text-[15px] outline-none focus:border-primary"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-[48px] w-full rounded-xl border border-line px-3 text-[15px] outline-none focus:border-primary"
              >
                {WRITE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`community.categoryFilter.${c}`)}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.loading') : t('community.publish')}
              </Button>
            </form>
          </Card>
        )}

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : posts.length === 0 ? (
          <Card className="text-[14px] text-ink-faint">{t('community.empty')}</Card>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link to={`/community/${post.id}`}>
                  <Card className="transition-transform duration-200 ease-ios active:scale-[0.99]">
                    <div className="mb-1.5">
                      <Badge tone="neutral">{t(`community.categoryFilter.${post.category}`, post.category)}</Badge>
                    </div>
                    <p className="text-[16px] font-semibold text-ink">{post.title}</p>
                    <p className="mt-1 line-clamp-2 text-[14px] text-ink-soft">{post.content}</p>
                    <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-faint">
                      <span>{post.author?.username ?? '익명'}</span>
                      <span>·</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
