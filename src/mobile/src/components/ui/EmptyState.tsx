import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  emoji: string;
  title: string;
  action?: ReactNode;
}

export default function EmptyState({ emoji, title, action }: EmptyStateProps) {
  return (
    <View className="items-center px-6 py-16">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="mt-3 text-center text-[15px] text-ink-soft">{title}</Text>
      {action ? <View className="mt-5 w-full">{action}</View> : null}
    </View>
  );
}
