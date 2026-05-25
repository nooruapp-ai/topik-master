-- 작업 5 (Phase 3): 알림 테이블
-- Supabase SQL Editor 에 붙여넣어 1회 실행하세요. (재실행 안전)
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,   -- 받는 사람
  actor_id    uuid references users (id) on delete set null,           -- 발생시킨 사람
  type        text not null check (type in ('like', 'comment', 'friend_request')),
  target_type text,
  target_id   uuid,
  message     text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications (user_id, is_read);
