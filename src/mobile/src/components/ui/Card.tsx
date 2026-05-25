import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  padded?: boolean;
  className?: string;
}

// 웹앱의 shadow-card 를 RN 의 iOS shadow*/Android elevation 으로 재현합니다.
const shadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function Card({ children, padded = true, className = '', style, ...props }: CardProps) {
  return (
    <View
      className={`rounded-card border border-surface-muted bg-white ${padded ? 'p-5' : ''} ${className}`}
      style={[shadow, style]}
      {...props}
    >
      {children}
    </View>
  );
}
