# TOPIK 마스터 — 모바일 앱 (Expo / React Native)

웹앱(`src/frontend`)과 동일한 기능·디자인을 iOS/Android 네이티브로 제공합니다.
백엔드 API(`src/backend`, 포트 5000)를 그대로 공유합니다.

## 기술 스택

- **Expo SDK 56** (React Native 0.85, React 19.2, Hermes V1)
- **NativeWind v4** + Tailwind v3 — 웹앱과 동일한 디자인 토큰(`tailwind.config.js`)
- **React Navigation v7** — 인증 스택 + 하단 탭(Bottom Tabs)
- **axios + AsyncStorage** — JWT 토큰 저장 및 인터셉터(웹의 localStorage 대체)
- **i18next** — 한국어(ko)

> 참고: 요구 사항의 React Navigation v6 대신, SDK 56(React 19) 호환을 위해 v7 을 사용했습니다.
> API(Bottom Tabs + Stack) 구조는 동일합니다.

## 사전 준비

1. **Expo Go 앱 설치** (스마트폰)
   - iOS: App Store → "Expo Go"
   - Android: Play Store → "Expo Go"
   - SDK 56 을 지원하는 최신 버전이어야 합니다.
2. **백엔드 실행** (저장소 루트에서)
   ```bash
   npm run dev:backend     # http://localhost:5000 에서 실행
   ```
3. **개발 PC 와 스마트폰을 같은 Wi‑Fi(LAN)** 에 연결합니다.

## 실행

```bash
cd src/mobile
npm install        # 최초 1회
npm start          # = expo start, 터미널에 QR 코드 출력
```

터미널에 표시된 **QR 코드를 Expo Go 앱으로 스캔**하면 앱이 로딩됩니다.
- iOS: 기본 카메라 앱으로 스캔 → Expo Go 로 열기
- Android: Expo Go 앱 안의 "Scan QR code"

## API 주소 설정

- 기본값은 `.env` 의 `EXPO_PUBLIC_API_URL=http://localhost:5000/api` 입니다.
- 실기기/시뮬레이터에서는 `localhost` 가 폰 자신을 가리키므로,
  `src/api/client.ts` 의 `resolveBaseURL()` 이 **Expo 디버거 호스트(개발 PC 의 LAN IP)로 자동 치환**합니다.
- 따라서 별도 설정 없이 같은 네트워크에서 동작합니다.
  다른 백엔드 주소를 쓰려면 `.env` 의 값을 직접 지정하세요.

> 네이티브 요청은 브라우저 CORS 정책의 영향을 받지 않으므로 백엔드 CORS 설정 변경 없이 동작합니다.

## 검증 명령

```bash
npm run typecheck   # tsc --noEmit
npx expo export -p android   # 프로덕션 번들 빌드 확인
```

## 폴더 구조

```
src/
  api/          백엔드 API 클라이언트(axios) + 도메인별 모듈
  components/ui/ Button·Card·Input·Badge·Avatar 등 디자인 시스템
  context/      AuthContext (AsyncStorage 세션)
  i18n/         i18next 설정 + ko.json
  navigation/   RootNavigator(인증 게이트) + MainTabs(하단 탭)
  screens/      Login·Signup·Home·Learning·Test·League·Community·Profile
  types/        공용 타입(웹과 동일)
```
