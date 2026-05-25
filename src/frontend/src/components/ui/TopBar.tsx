import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  showBell?: boolean;
  showSearch?: boolean;
}

export default function TopBar({
  title,
  showBack = false,
  right,
  showBell = true,
  showSearch = true,
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1 bg-surface-soft/80 px-5 backdrop-blur-lg">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="-ml-2 flex h-11 w-11 items-center justify-center text-ink"
        >
          <ChevronLeft size={24} strokeWidth={1.75} />
        </button>
      )}
      {title && <h1 className="text-title-m text-ink">{title}</h1>}
      <div className="ml-auto flex items-center gap-1">
        {right ?? (
          <>
            {showSearch && (
              <Link
                to="/search"
                aria-label="검색"
                className="flex h-11 w-11 items-center justify-center text-ink"
              >
                <Search size={22} strokeWidth={1.75} />
              </Link>
            )}
            {showBell && <NotificationBell />}
          </>
        )}
      </div>
    </header>
  );
}
