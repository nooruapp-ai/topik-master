import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface TopBarProps {
  title: string;
  right?: ReactNode;
}

export default function TopBar({ title, right }: TopBarProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
      <Text className="text-title-l text-ink">{title}</Text>
      {right}
    </View>
  );
}
