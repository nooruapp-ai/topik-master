-- 시스템 5: 개인 약점 분석 + 맞춤 추천
-- user_weaknesses: 사용자별 약점/강점 캐시 (제출 분석 결과)
-- Supabase SQL Editor 에 실행하세요. (재실행 안전)

create table if not exists user_weaknesses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users (id) on delete cascade,
  weak_grammar    jsonb not null default '[]'::jsonb,   -- [{tag, total, wrong}]
  weak_vocabulary jsonb not null default '[]'::jsonb,   -- [{tag, total, wrong}]
  weak_categories jsonb not null default '[]'::jsonb,   -- [{category, total, correct, accuracy}]
  strong_areas    jsonb not null default '[]'::jsonb,   -- [{category, accuracy}]
  last_updated    timestamptz not null default now()
);
create unique index if not exists uq_user_weaknesses_user on user_weaknesses (user_id);

-- 참고: 약점 계산은 백엔드 services/analytics.ts 가 제출 내역(submissions)과
-- problems 의 grammar_tags/vocabulary_tags 를 집계해 수행하며, 조회 시 이 테이블에 upsert 합니다.
-- 매일 자정 일괄 갱신은 향후 cron(또는 Supabase scheduled function)으로 이 로직을 호출하도록 준비되어 있습니다.
