import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

const container: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-primary-light',
  ghost: 'border border-line bg-transparent',
};

const label: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-primary',
  ghost: 'text-ink-soft',
};

const spinnerColor: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: '#6366F1',
  ghost: '#6B7280',
};

export default function Button({
  variant = 'primary',
  fullWidth = true,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={isDisabled}
      className={`h-[52px] flex-row items-center justify-center gap-2 rounded-btn px-6 ${container[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-50' : 'active:opacity-90'} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor[variant]} />
      ) : typeof children === 'string' ? (
        <Text className={`text-[16px] font-semibold ${label[variant]}`}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
