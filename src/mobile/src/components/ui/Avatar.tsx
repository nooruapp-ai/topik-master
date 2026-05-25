import { memo } from 'react';
import { Text, View } from 'react-native';

type Size = 'sm' | 'md' | 'lg';

const box: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const text: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

interface AvatarProps {
  name?: string | null;
  size?: Size;
  className?: string;
}

function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initial = (name?.trim()?.charAt(0) || '?').toUpperCase();
  return (
    <View
      className={`shrink-0 items-center justify-center rounded-full bg-primary ${box[size]} ${className}`}
    >
      <Text className={`font-bold text-white ${text[size]}`}>{initial}</Text>
    </View>
  );
}

export default memo(Avatar);
