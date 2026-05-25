import { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  className?: string;
}

const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, secureTextEntry, className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View>
      {label && (
        <Text className="mb-1.5 text-[14px] font-medium text-ink-soft">{label}</Text>
      )}
      <View className="justify-center">
        <TextInput
          ref={ref}
          secureTextEntry={isPassword && !show}
          placeholderTextColor="#9CA3AF"
          className={`h-[52px] w-full rounded-xl border border-line bg-white px-4 text-[16px] text-ink focus:border-primary ${
            isPassword ? 'pr-12' : ''
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShow((v) => !v)}
            hitSlop={10}
            className="absolute right-3"
            accessibilityLabel="toggle password"
          >
            {show ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
});

export default Input;
