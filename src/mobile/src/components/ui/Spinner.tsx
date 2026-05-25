import { ActivityIndicator, View } from 'react-native';

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className = 'py-16' }: SpinnerProps) {
  return (
    <View className={`items-center justify-center ${className}`}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}
