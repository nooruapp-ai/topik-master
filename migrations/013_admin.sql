-- 시스템 3: 관리자 검토 시스템
-- admins(권한) + ai_learning_log(승인/거부 학습 로그)
-- Supabase SQL Editor 에 실행하세요. (재실행 안전)

create table if not exists admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users (id) on delete cascade,
  role       text not null default 'admin',   -- admin / super_admin
  created_at timestamptz not null default now()
);
create unique index if not exists uq_admins_user on admins (user_id);

create table if not exists ai_learning_log (
  id             uuid primary key default gen_random_uuid(),
  problem_id     uuid references problems (id) on delete set null,
  action         text not null,               -- approved / rejected
  error_pattern  text,                         -- 거부 사유(오류 패턴)
  lesson_learned text,                          -- 다음 생성에 반영할 교훈
  created_at     timestamptz not null default now()
);
create index if not exists idx_ai_learning_log_action on ai_learning_log (action);
create index if not exists idx_ai_learning_log_created on ai_learning_log (created_at desc);

-- nooruapp@gmail.com 자동 super_admin 등록 (가입되어 있는 경우)
insert into admins (user_id, role)
select id, 'super_admin' from users where email = 'nooruapp@gmail.com'
on conflict (user_id) do update set role = 'super_admin';
