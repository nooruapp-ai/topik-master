import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '../../api/notifications';

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    // 알림 테이블 미적용 시에도 깨지지 않도록 에러는 무시합니다.
    getUnreadCount()
      .then((c) => active && setCount(c))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <Link
      to="/notifications"
      aria-label="알림"
      className="relative flex h-10 w-10 items-center justify-center text-ink"
    >
      <Bell size={22} strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
