import type { ReactNode } from 'react';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ emoji = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-surface-muted bg-white px-6 py-12 text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 text-[13px] text-ink-soft">{description}</p>}
      {action && <div className="mt-5 w-full max-w-[200px]">{action}</div>}
    </div>
  );
}
