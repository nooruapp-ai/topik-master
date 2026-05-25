import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPost, updatePost, deletePost, getLikeStatus, toggleLike } from '../api/posts';
import { getComments, createComment, deleteComment } from '../api/comments';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Post, Comment } from '../types';
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

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.allSettled([getPost(id), getLikeStatus(id), getComments(id)]).then((results) => {
      if (!active) return;
      const [postR, likeR, commentsR] = results;
      if (postR.status === 'fulfilled') {
        setPost(postR.value);
        setTitle(postR.value.title);
        setContent(postR.value.content);
        setLikeCount(postR.value.like_count ?? 0);
      } else {
        setError(getErrorMessage(postR.reason));
      }
      if (likeR.status === 'fulfilled') setLiked(likeR.value);
      if (commentsR.status === 'fulfilled') setComments(commentsR.value);
      setLoading(false);
    });
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

  async function handleToggleLike() {
    if (!id) return;
    try {
      const result = await toggleLike(id);
      setLiked(result.liked);
      setLikeCount(result.like_count);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    setCommentBusy(true);
    try {
      const c = await createComment(id, newComment.trim());
      setComments((prev) => [...prev, c]);
      setNewComment('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!window.confirm(t('community.deleteCommentConfirm'))) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(getErrorMessage(err));
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

          <button
            onClick={handleToggleLike}
            className={`mt-5 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              liked ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500'
            }`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{t('community.like')} {likeCount}</span>
          </button>

          {isOwner && (
            <div className="mt-4 flex gap-2">
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

      {/* 댓글 섹션 */}
      {post && !editing && (
        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold text-gray-900">
            {t('community.comments')} {comments.length}
          </h2>

          {comments.length === 0 ? (
            <p className="mb-3 rounded-xl bg-white p-4 text-sm text-gray-400">
              {t('community.noComments')}
            </p>
          ) : (
            <ul className="mb-3 space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-2xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">
                      {c.author?.username ?? '익명'}
                    </span>
                    {user && c.user_id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-xs text-red-400"
                      >
                        {t('community.delete')}
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{c.content}</p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('community.commentPlaceholder')}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={commentBusy || !newComment.trim()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t('community.addComment')}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
