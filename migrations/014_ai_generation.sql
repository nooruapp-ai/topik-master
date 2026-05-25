-- 시스템 4: AI 자동 문제 생성
-- generation_jobs: 생성 작업 이력 (수동 트리거/향후 cron 공용)
-- Supabase SQL Editor 에 실행하세요. (재실행 안전)

create table if not exists generation_jobs (
  id            uuid primary key default gen_random_uuid(),
  level         text,
  category      text,
  scheduled_at  timestamptz,                       -- 예약 실행 시각 (cron 용, 수동은 NULL)
  status        text not null default 'pending',   -- pending/running/completed/failed
  total_count   integer not null default 0,
  success_count integer not null default 0,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index if not exists idx_generation_jobs_status on generation_jobs (status);
create index if not exists idx_generation_jobs_created on generation_jobs (created_at desc);

-- 참고: 실제 생성은 백엔드 services/aiGeneration.ts 가 수행합니다.
-- 기출 패턴(70%) + 변형(20%) + 예측(10%) 구성으로 후보를 만들고,
-- 어법/정답/변별력 3중 자체 검증을 통과한 문제만 status='pending' 으로 저장합니다.
-- ai_learning_log(거부 사유)를 참고해 동일 오류를 피하도록 설계되어 있습니다.
