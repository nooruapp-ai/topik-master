import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // 성공 시 isAuthenticated 변화로 RootNavigator 가 자동 전환됩니다.
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-5">
        <View className="mb-10 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-xl3 bg-primary">
            <Text className="text-3xl font-bold text-white">한</Text>
          </View>
          <Text className="text-title-l text-ink">{t('app.name')}</Text>
          <Text className="mt-1.5 text-[14px] text-ink-soft">{t('app.tagline')}</Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry
          />
          {error ? <Text className="text-[14px] text-error">{error}</Text> : null}
          <Button onPress={handleSubmit} loading={submitting} className="mt-2">
            {t('auth.loginButton')}
          </Button>
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-[14px] text-ink-soft">{t('auth.noAccount')} </Text>
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text className="text-[14px] font-semibold text-primary">{t('auth.goSignup')}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
