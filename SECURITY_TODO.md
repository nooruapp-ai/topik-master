# 🔐 배포 전 보안 체크리스트 (SECURITY TODO)

프로덕션 배포 전에 반드시 처리할 항목입니다. (실제 키 값은 이 문서에 적지 않습니다.)

## 필수 — 배포 차단 항목

- [ ] **JWT_SECRET 변경**
  현재 값은 개발용 고정 문자열입니다. 길고 임의적인 시크릿으로 교체하세요.
  예: `openssl rand -base64 48` 결과 사용. 프로덕션에서는 코드/리포가 아닌 환경변수·시크릿 매니저로 주입.

- [ ] **Supabase 키 재발급 (현재 노출됨)**
  publishable/secret 키가 로컬 `.env` 및 대화 기록에 노출되었습니다.
  Supabase 대시보드 → **Project Settings → API → Reissue/Roll keys** 로 재발급한 뒤 `.env` 를 갱신하고, 기존 키는 폐기하세요.
  특히 `SUPABASE_SERVICE_ROLE_KEY`(secret)는 DB 전체 권한을 가지므로 최우선 재발급 대상입니다.

- [ ] **HTTPS 적용**
  프론트엔드·백엔드 모두 TLS 뒤에서 서비스하고, `FRONTEND_URL` 과 CORS 오리진을 `https://` 도메인으로 변경하세요.

## 추가 권장

- [ ] `.env` 가 절대 커밋되지 않는지 재확인: `git check-ignore src/backend/.env`
- [ ] 백엔드는 서버 전용 **service_role(secret) 키**로 Supabase 에 접속하고, 이 키는 프론트엔드 번들에 포함하지 않기.
- [ ] `NODE_ENV=production` 설정 + 에러 응답에서 내부 메시지/스택 노출 최소화.
- [ ] Supabase 테이블 **RLS 정책** 적용 검토 (publishable/anon 키를 함께 쓸 경우 필수).
- [ ] `npm audit` 로 의존성 취약점 점검.
