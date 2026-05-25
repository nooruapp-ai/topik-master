# TOPIK 마스터 🇰🇷

한국어능력시험(TOPIK) 학습 앱 — **Phase 1**.
학습 / 테스트 / 리그 / 커뮤니티 기능과 JWT 인증을 갖춘 모바일 웹앱입니다.

## 기술 스택

| 구분 | 스택 |
| --- | --- |
| 프론트엔드 | React 18 · TypeScript · Vite · Tailwind CSS · React Router · i18next |
| 백엔드 | Node.js · Express · TypeScript · Supabase · JWT |
| 데이터베이스 | PostgreSQL (Supabase) — 14개 테이블 |

- Primary 컬러: `#2563EB`
- 모바일 우선 반응형 (320px~), 하단 탭바 네비게이션
- 한국어 i18n (`src/frontend/src/locales/ko.json`)

## 폴더 구조

```
topik-master/
├── package.json            # npm workspaces 루트 (dev/build/typecheck 통합)
├── DATABASE_SCHEMA.sql     # Supabase 에 붙여넣는 전체 스키마 + 시드
├── src/
│   ├── backend/            # Express API (포트 5000)
│   │   ├── src/
│   │   │   ├── config/     # env, supabase 클라이언트
│   │   │   ├── middleware/ # 인증, 에러 핸들링
│   │   │   ├── routes/     # auth, courses, problems, submissions, posts, leaderboard, users
│   │   │   ├── utils/      # jwt, asyncHandler
│   │   │   └── index.ts    # 진입점
│   │   └── .env.example
│   └── frontend/           # React 앱 (포트 3000)
│       └── src/
│           ├── api/        # axios 클라이언트 + 도메인별 API
│           ├── components/ # TabBar, Layout, ProtectedRoute, Spinner
│           ├── context/    # AuthContext (JWT + localStorage)
│           ├── locales/    # ko.json
│           ├── pages/      # Login, Signup, Home, Learning, Test, League, Community, Profile
│           └── types/
```

## 사전 준비 — Supabase 설정

1. [Supabase](https://app.supabase.com) 에서 프로젝트를 생성합니다.
2. **SQL Editor** 에 저장소 루트의 [`DATABASE_SCHEMA.sql`](./DATABASE_SCHEMA.sql) 전체를 붙여넣고 실행합니다. (14개 테이블 + 데모 강좌/문제 시드 생성)
3. **Project Settings → API** 에서 `Project URL` 과 `service_role` 키를 복사합니다.
   > 백엔드는 자체 JWT 인증을 사용하므로 RLS 를 우회하는 `service_role` 키를 사용합니다. 이 키는 절대 프론트엔드에 노출하지 마세요.

### 백엔드 환경변수

`src/backend/.env.example` 을 `src/backend/.env` 로 복사한 뒤 값을 채웁니다.

```bash
cp src/backend/.env.example src/backend/.env
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
JWT_SECRET=충분히-길고-임의의-비밀키
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## 실행 방법

저장소 **루트**에서 (npm workspaces 로 두 패키지를 한 번에 관리합니다):

```bash
# 1) 의존성 설치 (frontend + backend 모두)
npm install

# 2) 프론트엔드(3000) + 백엔드(5000) 동시 실행
npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5000/api  (헬스체크: `/api/health`)
- 프론트엔드의 `/api/*` 요청은 Vite 프록시를 통해 백엔드(5000)로 전달됩니다.

### 개별 실행 / 기타 명령

```bash
npm run dev:backend    # 백엔드만 실행
npm run dev:frontend   # 프론트엔드만 실행
npm run typecheck      # 프론트 + 백엔드 타입체크
npm run build          # 프로덕션 빌드
```

## API 엔드포인트

| 메서드 | 경로 | 설명 | 인증 |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | 회원가입 (JWT 발급) | — |
| POST | `/api/auth/login` | 로그인 (JWT 발급) | — |
| GET | `/api/courses` | 강좌 목록 (`?level=`) | — |
| GET | `/api/courses/:id` | 강좌 상세 (레슨 포함) | — |
| GET | `/api/problems` | 문제 목록 (`?category=&level=&limit=`) | — |
| POST | `/api/submissions` | 문제 답안 제출/채점 | ✅ |
| GET | `/api/posts` | 커뮤니티 글 목록 | — |
| POST | `/api/posts` | 글 작성 | ✅ |
| GET | `/api/leaderboard/weekly` | 주간 랭킹 | — |
| GET | `/api/leaderboard/global` | 전체 랭킹 | — |
| GET | `/api/users/:id/statistics` | 학습 통계 | — |

인증이 필요한 요청은 `Authorization: Bearer <token>` 헤더를 보냅니다 (프론트엔드가 자동 처리).

## 페이지

로그인 / 회원가입 + 하단 탭바 6개 (홈 · 학습 · 테스트 · 리그 · 커뮤니티 · 프로필).
시드 데이터 덕분에 로그인 후 **학습**·**테스트** 탭에서 바로 강좌와 문제를 확인할 수 있습니다.

## 데이터베이스 (14개 테이블)

`users`, `user_profiles`, `courses`, `lessons`, `problems`, `submissions`,
`results`, `posts`, `comments`, `messages`, `leaderboards`, `friends`,
`ai_evaluations`, `user_progress`
