import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ko from './ko.json';
import ja from './ja.json';

export const LANG_KEY = 'topik_lang';
export type Lang = 'ko' | 'ja';

// 타겟 사용자가 일본인이므로 기본 언어는 일본어입니다.
void i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    ja: { translation: ja },
  },
  lng: 'ja',
  fallbackLng: 'ja',
  interpolation: { escapeValue: false },
});

// 저장된 언어 선택을 비동기로 복원합니다.
void AsyncStorage.getItem(LANG_KEY).then((saved) => {
  if (saved === 'ko' || saved === 'ja') void i18n.changeLanguage(saved);
});

/** 언어를 전환하고 선택을 저장합니다. */
export function setLanguage(lng: Lang): void {
  void i18n.changeLanguage(lng);
  void AsyncStorage.setItem(LANG_KEY, lng);
}

export default i18n;
