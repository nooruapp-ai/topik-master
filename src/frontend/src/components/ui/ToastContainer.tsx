import { useEffect, useState } from 'react';
import { subscribe, type ToastItem, type ToastType } from '../../lib/toast';

const toneClass: Record<ToastType, string> = {
  error: 'bg-error',
  success: 'bg-success',
  info: 'bg-ink',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-full max-w-mobile -translate-x-1/2 flex-col items-center gap-2 px-5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full rounded-xl px-4 py-3 text-center text-[14px] font-medium text-white shadow-floating ${toneClass[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
