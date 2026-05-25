import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getNotifications, markAllRead } from '../api/notifications';
import { getErrorMessage } from '../api/client';
import type { AppNotification } from '../types';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

const ICONS: Record<string, LucideIcon> = {
  like: Heart,
  comment: MessageCircle,
  friend_request: UserPlus,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function Notifications() {
  const { t } = useTranslation();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getNotifications()
      .then((data) => active && setItems(data))
      .catch((e) => active && setError(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    // 화면 진입 시 모두 읽음 처리 (best-effort)
    markAllRead().catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <TopBar title={t('notifications.title')} showBack showBell={false} />
      <div className="px-5 pt-2">
        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : items.length === 0 ? (
          <EmptyState emoji="🔔" title={t('notifications.empty')} />
        ) : (
          <ul className="space-y-2.5">
            {items.map((n) => {
              const Icon = ICONS[n.type] ?? Heart;
              const body = (
                <Card
                  padded={false}
                  className={`flex items-center gap-3 p-4 ${n.is_read ? '' : 'border-l-4 border-l-primary'}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-ink">
                      <span className="font-semibold">{n.actor?.username ?? t('common.someone')}</span>
                      {t('notifications.actorSuffix')}{' '}
                      {n.message ?? ''}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-faint">{formatDate(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </Card>
              );
              return (
                <li key={n.id}>
                  {n.target_type === 'post' && n.target_id ? (
                    <Link to={`/community/${n.target_id}`}>{body}</Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
