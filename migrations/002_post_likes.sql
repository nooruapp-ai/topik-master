-- 작업 2: 좋아요 중복 방지용 테이블 (Phase 2)
-- Supabase SQL Editor 에 붙여넣어 1회 실행하세요.
create table if not exists post_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  user_id    uuid not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)   -- 한 사용자가 같은 글에 좋아요 1번만
);
create index if not exists idx_post_likes_post on post_likes (post_id);
create index if not exists idx_post_likes_user on post_likes (user_id);
