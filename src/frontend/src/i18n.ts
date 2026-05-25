import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import ja from './locales/ja.json';

export const LANG_KEY = 'topik_lang';
export type Lang = 'ko' | 'ja';

// 개발 중에는 기본 언어를 한국어로 사용합니다(출시 직전 'ja' 로 변경 예정).
// 저장된 선택이 있으면 우선합니다.
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'ko' || saved === 'ja') return saved;
  } catch {
    /* localStorage 미사용 환경 무시 */
  }
  return 'ko';
}

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    ja: { translation: ja },
  },
  lng: initialLang(),
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
});

/** 언어를 전환하고 선택을 저장합니다. */
export function setLanguage(lng: Lang): void {
  void i18n.changeLanguage(lng);
  try {
    localStorage.setItem(LANG_KEY, lng);
  } catch {
    /* 무시 */
  }
}

export default i18n;
