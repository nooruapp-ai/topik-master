-- 시스템 1: 학습 구조 확장 (007 의 후속 델타 — 멱등/추가 전용)
-- problem_types 보장 + problems 신규 컬럼(검토 상태/생성자/문법·어휘 태그/예측 난이도)
-- Supabase SQL Editor 에 실행하세요. (재실행 안전)

-- problem_types 보장 (007 미실행 환경 대비)
create table if not exists problem_types (
  id               uuid primary key default gen_random_uuid(),
  level            text    not null,
  category         text    not null,
  type_number      integer not null,
  type_name        text    not null,
  description      text,
  question_numbers text,
  tips             jsonb   not null default '[]'::jsonb,
  warnings         jsonb   not null default '[]'::jsonb,
  real_review      text,
  difficulty       integer not null default 3,
  avg_accuracy     integer,
  created_at       timestamptz not null default now()
);
create index if not exists idx_problem_types_level on problem_types (level);
create index if not exists idx_problem_types_level_category on problem_types (level, category);
-- 011 의 upsert/재시드 및 자연키 링크에 필요
create unique index if not exists uq_problem_types_key on problem_types (level, category, type_number);

-- problems 학습 컬럼 보장 (007 미실행 대비) + 시스템 1 신규 컬럼
alter table problems add column if not exists type_id               uuid references problem_types (id) on delete set null;
alter table problems add column if not exists hint                  text;
alter table problems add column if not exists detailed_explanation  text;
alter table problems add column if not exists wrong_answer_analysis jsonb;
alter table problems add column if not exists learning_point        text;
alter table problems add column if not exists review_tip            text;
alter table problems add column if not exists status                text   not null default 'approved';   -- pending/approved/rejected
alter table problems add column if not exists created_by            text   not null default 'admin';      -- ai/admin
alter table problems add column if not exists grammar_tags          jsonb  not null default '[]'::jsonb;   -- 사용된 문법 태그
alter table problems add column if not exists vocabulary_tags       jsonb  not null default '[]'::jsonb;   -- 사용된 어휘 태그
alter table problems add column if not exists difficulty_predicted  integer;                                -- AI 예측 난이도 1-5

create index if not exists idx_problems_type on problems (type_id);
create index if not exists idx_problems_status on problems (status);

-- =====================================================================
-- 기존 50문제 태그 백필 (시스템 5 약점 분석용). 멱등 UPDATE.
-- =====================================================================
update problems set grammar_tags='["조사","주격조사"]'::jsonb     where category='grammar' and level=1 and correct_answer in ('이','가');
update problems set grammar_tags='["조사","보조사"]'::jsonb       where category='grammar' and level=1 and correct_answer in ('은','는');
update problems set grammar_tags='["조사","목적격조사"]'::jsonb   where category='grammar' and level=2 and correct_answer in ('을','를');
update problems set grammar_tags='["조사","처소격조사"]'::jsonb   where category='grammar' and level=2 and correct_answer in ('에','에서');
update problems set grammar_tags='["연결어미"]'::jsonb            where category='grammar' and level in (3,4);
update problems set vocabulary_tags='["반의어"]'::jsonb           where category='vocabulary' and question like '%반대말%';
update problems set vocabulary_tags='["유의어"]'::jsonb           where category='vocabulary' and question like '%비슷한 말%';
update problems set vocabulary_tags='["한자어"]'::jsonb           where category='vocabulary' and level=5;
update problems set vocabulary_tags='["관용표현"]'::jsonb         where category='vocabulary' and level=6;

-- 기존 문제는 모두 관리자 승인 상태로 간주
update problems set status='approved' where status is null;
update problems set created_by='admin' where created_by is null;
