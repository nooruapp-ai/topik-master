import './global.css';
import './src/i18n';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-surface-soft">
        <View className="flex-1 items-center justify-center px-5">
          <View className="h-16 w-16 items-center justify-center rounded-xl3 bg-primary">
            <Text className="text-3xl font-bold text-white">한</Text>
          </View>
          <Text className="mt-4 text-title-l text-ink">TOPIK 마스터</Text>
          <Text className="mt-1 text-ink-soft">모바일 앱 셋업 완료</Text>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
