import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './ko.json';

// 웹앱과 동일한 한국어 리소스를 사용합니다.
void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko } },
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

export default i18n;
