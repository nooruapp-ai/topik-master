import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { getBookmarkStatus, toggleBookmark, type BookmarkTarget } from '../../api/bookmarks';

interface BookmarkButtonProps {
  type: BookmarkTarget;
  id: string;
}

export default function BookmarkButton({ type, id }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    // 북마크 테이블 미적용 시에도 UI 가 깨지지 않도록 에러는 무시합니다.
    getBookmarkStatus(type, id)
      .then((v) => active && setSaved(v))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [type, id]);

  async function onClick() {
    setBusy(true);
    try {
      const result = await toggleBookmark(type, id);
      setSaved(result.bookmarked);
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label="북마크"
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
        saved ? 'text-primary' : 'text-ink-faint'
      }`}
    >
      <Bookmark size={22} strokeWidth={1.75} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
