import type { ReactNode } from 'react';

type Tone = 'primary' | 'coral' | 'mint' | 'yellow' | 'neutral';

const tones: Record<Tone, string> = {
  primary: 'bg-primary-light text-primary',
  coral: 'bg-accent-coral/30 text-[#D9534F]',
  mint: 'bg-accent-mint/40 text-[#1F8A60]',
  yellow: 'bg-accent-yellow/50 text-[#B5860B]',
  neutral: 'bg-surface-muted text-ink-soft',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export default function Badge({ tone = 'primary', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
