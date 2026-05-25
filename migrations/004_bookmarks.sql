-- 작업 4 (Phase 3): 북마크 테이블
-- Supabase SQL Editor 에 붙여넣어 1회 실행하세요. (재실행 안전)
create table if not exists bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  target_type text not null check (target_type in ('course', 'problem', 'post')),
  target_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (user_id, target_type, target_id)   -- 동일 콘텐츠 중복 북마크 방지
);
create index if not exists idx_bookmarks_user on bookmarks (user_id);
