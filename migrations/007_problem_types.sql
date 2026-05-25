-- 작업 1: 학습 구조 개편 — 유형(problem_types) 테이블 신규 + problems 컬럼 확장
-- 구조: 레벨(topik1/topik2_mid/topik2_high) × 영역(듣기/읽기/문법/쓰기/어휘) × 유형 × 문제
-- Supabase SQL Editor 에 붙여넣어 실행하세요. (재실행 안전: if not exists / add column if not exists)

-- =============================================================
-- (1) problem_types — 유형 메타데이터 + 꿀팁/함정/실전 후기
-- =============================================================
create table if not exists problem_types (
  id               uuid primary key default gen_random_uuid(),
  level            text    not null,                 -- 'topik1' | 'topik2_mid' | 'topik2_high'
  category         text    not null,                 -- 'listening' | 'reading' | 'writing' | 'grammar' | 'vocabulary'
  type_number      integer not null,                 -- 유형 번호 (영역 내 정렬 기준)
  type_name        text    not null,                 -- "그림 고르기"
  description      text,                              -- 유형 설명
  question_numbers text,                              -- "1-4번"
  tips             jsonb   not null default '[]'::jsonb,   -- 꿀팁 배열(보통 5개)
  warnings         jsonb   not null default '[]'::jsonb,   -- 자주 틀리는 함정 배열
  real_review      text,                              -- 실전 합격자 후기
  difficulty       integer not null default 3,        -- 난이도 1-5
  avg_accuracy     integer,                           -- 평균 정답률 0-100
  created_at       timestamptz not null default now()
);

create index if not exists idx_problem_types_level on problem_types (level);
create index if not exists idx_problem_types_level_category on problem_types (level, category);

-- =============================================================
-- (2) problems 컬럼 확장 — 힌트/상세 해설/오답 분석/학습 포인트/꿀팁 복습
-- =============================================================
alter table problems add column if not exists type_id               uuid references problem_types (id) on delete set null;
alter table problems add column if not exists hint                  text;   -- 답 유추 힌트
alter table problems add column if not exists detailed_explanation  text;   -- 공식 기반 상세 해설
alter table problems add column if not exists wrong_answer_analysis jsonb;  -- 오답별 분석 (보기 번호 → 설명)
alter table problems add column if not exists learning_point        text;   -- 이 문제에서 배울 문법/어휘
alter table problems add column if not exists review_tip            text;   -- 해설 후 다시 보여줄 꿀팁

create index if not exists idx_problems_type on problems (type_id);
