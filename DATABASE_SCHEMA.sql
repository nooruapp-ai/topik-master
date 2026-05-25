-- =============================================================
-- TOPIK 마스터 - 데이터베이스 스키마 (PostgreSQL / Supabase)
-- 사용법: Supabase 대시보드 → SQL Editor 에 전체 붙여넣기 후 실행
-- 백엔드는 service_role 키로 접속하므로 RLS 없이 동작합니다.
-- (anon 키를 쓸 경우 별도 RLS 정책이 필요합니다)
-- =============================================================

create extension if not exists pgcrypto;

-- updated_at 자동 갱신용 트리거 함수 --------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- 1. users (계정)
-- =============================================================
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  username      text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_users_email on users (email);

create trigger trg_users_updated
  before update on users
  for each row execute function set_updated_at();

-- =============================================================
-- 2. user_profiles (프로필/포인트)
-- =============================================================
create table if not exists user_profiles (
  user_id        uuid primary key references users (id) on delete cascade,
  level          integer not null default 1,
  target_level   integer,
  total_points   integer not null default 0,
  current_streak integer not null default 0,
  bio            text,
  avatar_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trg_user_profiles_updated
  before update on user_profiles
  for each row execute function set_updated_at();

-- =============================================================
-- 3. courses (강좌)
-- =============================================================
create table if not exists courses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  level         integer not null default 1,        -- TOPIK 1~6급
  category      text,                               -- grammar / vocabulary / listening ...
  thumbnail_url text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_courses_level on courses (level);

-- =============================================================
-- 4. lessons (레슨)
-- =============================================================
create table if not exists lessons (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses (id) on delete cascade,
  title       text not null,
  content     text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_lessons_course on lessons (course_id);

-- =============================================================
-- 5. problems (문제)
-- =============================================================
create table if not exists problems (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid references lessons (id) on delete set null,
  course_id      uuid references courses (id) on delete set null,
  category       text not null default 'reading',   -- listening/reading/writing/grammar/vocabulary
  level          integer not null default 1,
  type           text not null default 'multiple_choice', -- multiple_choice / short_answer
  question       text not null,
  options        jsonb,                              -- ["보기1","보기2",...]
  correct_answer text not null,
  explanation    text,
  points         integer not null default 10,
  created_at     timestamptz not null default now()
);
create index if not exists idx_problems_category on problems (category);
create index if not exists idx_problems_level on problems (level);
create index if not exists idx_problems_lesson on problems (lesson_id);

-- =============================================================
-- 6. submissions (문제 제출 기록)
-- =============================================================
create table if not exists submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users (id) on delete cascade,
  problem_id   uuid not null references problems (id) on delete cascade,
  user_answer  text,
  is_correct   boolean not null default false,
  score        integer not null default 0,
  submitted_at timestamptz not null default now()
);
create index if not exists idx_submissions_user on submissions (user_id);
create index if not exists idx_submissions_problem on submissions (problem_id);

-- =============================================================
-- 7. results (테스트 결과 요약)
-- =============================================================
create table if not exists results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users (id) on delete cascade,
  test_type       text not null default 'practice',
  total_questions integer not null default 0,
  correct_count   integer not null default 0,
  score           integer not null default 0,
  accuracy        numeric(5, 2) not null default 0,
  completed_at    timestamptz not null default now()
);
create index if not exists idx_results_user on results (user_id);

-- =============================================================
-- 8. posts (커뮤니티 게시글)
-- =============================================================
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users (id) on delete cascade,
  title         text not null,
  content       text not null,
  category      text not null default 'free',       -- free / question / tip
  like_count    integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_posts_category on posts (category);
create index if not exists idx_posts_created on posts (created_at desc);

create trigger trg_posts_updated
  before update on posts
  for each row execute function set_updated_at();

-- =============================================================
-- 9. comments (댓글)
-- =============================================================
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  user_id    uuid not null references users (id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_comments_post on comments (post_id);

-- =============================================================
-- 10. messages (1:1 메시지)
-- =============================================================
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references users (id) on delete cascade,
  receiver_id uuid not null references users (id) on delete cascade,
  content     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_messages_receiver on messages (receiver_id);

-- =============================================================
-- 11. leaderboards (랭킹)
-- =============================================================
create table if not exists leaderboards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users (id) on delete cascade,
  period       text not null default 'weekly',      -- weekly / global
  score        integer not null default 0,
  rank         integer not null default 0,
  period_start date,
  created_at   timestamptz not null default now()
);
create index if not exists idx_leaderboards_period on leaderboards (period, rank);

-- =============================================================
-- 12. friends (친구 관계)
-- =============================================================
create table if not exists friends (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users (id) on delete cascade,
  friend_id  uuid not null references users (id) on delete cascade,
  status     text not null default 'pending',       -- pending / accepted / blocked
  created_at timestamptz not null default now(),
  unique (user_id, friend_id)
);
create index if not exists idx_friends_user on friends (user_id);

-- =============================================================
-- 13. ai_evaluations (AI 채점/평가 - 주로 쓰기 영역)
-- =============================================================
create table if not exists ai_evaluations (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions (id) on delete cascade,
  user_id       uuid not null references users (id) on delete cascade,
  problem_id    uuid references problems (id) on delete set null,
  score         numeric(5, 2) not null default 0,
  feedback      text,
  criteria      jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists idx_ai_eval_user on ai_evaluations (user_id);

-- =============================================================
-- 14. user_progress (학습 진행도)
-- =============================================================
create table if not exists user_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users (id) on delete cascade,
  course_id        uuid references courses (id) on delete cascade,
  lesson_id        uuid references lessons (id) on delete cascade,
  status           text not null default 'in_progress', -- in_progress / completed
  progress_percent integer not null default 0,
  completed_at     timestamptz,
  updated_at       timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index if not exists idx_progress_user on user_progress (user_id);

create trigger trg_user_progress_updated
  before update on user_progress
  for each row execute function set_updated_at();

-- =============================================================
-- 시드 데이터 (데모용 강좌/레슨/문제)
-- =============================================================
insert into courses (id, title, description, level, category) values
  ('11111111-1111-1111-1111-111111111111', 'TOPIK 1급 기초 문법', '한국어 입문자를 위한 기초 문법 강좌입니다.', 1, 'grammar'),
  ('22222222-2222-2222-2222-222222222222', 'TOPIK 3급 어휘 마스터', '중급 필수 어휘를 체계적으로 학습합니다.', 3, 'vocabulary'),
  ('33333333-3333-3333-3333-333333333333', 'TOPIK 5급 읽기 전략', '고급 독해 지문 분석 전략을 배웁니다.', 5, 'reading')
on conflict (id) do nothing;

insert into lessons (course_id, title, content, order_index) values
  ('11111111-1111-1111-1111-111111111111', '인사 표현', '안녕하세요, 반갑습니다 등 기본 인사', 1),
  ('11111111-1111-1111-1111-111111111111', '조사 이/가', '주격 조사의 쓰임을 익힙니다.', 2),
  ('22222222-2222-2222-2222-222222222222', '감정 어휘', '기쁘다, 슬프다 등 감정 표현', 1)
on conflict do nothing;

insert into problems (category, level, type, question, options, correct_answer, explanation, points) values
  ('grammar', 1, 'multiple_choice', '저는 학생___ 입니다. 빈칸에 알맞은 것은?',
    '["이","가","은","를"]'::jsonb, '이', '받침이 있는 명사 뒤에는 "이"를 사용합니다.', 10),
  ('vocabulary', 1, 'multiple_choice', '"고맙습니다"와 비슷한 말은?',
    '["미안합니다","감사합니다","죄송합니다","괜찮습니다"]'::jsonb, '감사합니다', '"고맙습니다"와 "감사합니다"는 같은 의미입니다.', 10),
  ('reading', 3, 'multiple_choice', '다음 중 "시작하다"의 반대말은?',
    '["끝내다","멈추다","열다","닫다"]'::jsonb, '끝내다', '"시작하다"의 반대말은 "끝내다"입니다.', 15),
  ('grammar', 2, 'multiple_choice', '비가 와서 우산을 ___. 빈칸에 알맞은 것은?',
    '["씁니다","먹습니다","입습니다","신습니다"]'::jsonb, '씁니다', '우산은 "쓰다" 동사와 함께 사용합니다.', 10),
  ('vocabulary', 3, 'multiple_choice', '"매우"와 바꿔 쓸 수 있는 말은?',
    '["조금","아주","가끔","별로"]'::jsonb, '아주', '"매우"와 "아주"는 강조의 의미로 비슷합니다.', 15)
on conflict do nothing;
