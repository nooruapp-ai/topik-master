import { memo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

type Tone = 'primary' | 'coral' | 'mint' | 'yellow' | 'neutral';

const container: Record<Tone, string> = {
  primary: 'bg-primary-light',
  coral: 'bg-accent-coral/30',
  mint: 'bg-accent-mint/40',
  yellow: 'bg-accent-yellow/50',
  neutral: 'bg-surface-muted',
};

const label: Record<Tone, string> = {
  primary: 'text-primary',
  coral: 'text-[#D9534F]',
  mint: 'text-[#1F8A60]',
  yellow: 'text-[#B5860B]',
  neutral: 'text-ink-soft',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

function Badge({ tone = 'primary', children, className = '' }: BadgeProps) {
  return (
    <View className={`self-start rounded-full px-2.5 py-0.5 ${container[tone]} ${className}`}>
      <Text className={`text-[12px] font-semibold ${label[tone]}`}>{children}</Text>
    </View>
  );
}

export default memo(Badge);
