import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
}

export default function TopBar({ title, showBack = false, right }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1 bg-surface-soft/80 px-5 backdrop-blur-lg">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="-ml-2 flex h-10 w-10 items-center justify-center text-ink"
        >
          <ChevronLeft size={24} strokeWidth={1.75} />
        </button>
      )}
      {title && <h1 className="text-title-m text-ink">{title}</h1>}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  );
}
