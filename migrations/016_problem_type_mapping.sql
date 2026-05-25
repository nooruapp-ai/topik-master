-- 016: 기존 문제 type_id 자동 매핑 (학습 화면 "문제 준비 중" 해소)
-- 원인: problems.type_id 가 NULL 이거나 일부 유형에만 연결되어 빈 유형이 많았음.
-- 카테고리/레벨/하위주제 기반으로 적절한 유형에 분배하고, 남은 NULL 은 안전망으로 채웁니다.
-- 007/008(또는 010/011) 실행 후 마지막에 실행하세요. (멱등: 자연키 기반, 재실행 안전)

-- 진단(실행 전후 비교용):
--   select count(*) from problems where type_id is null;
--   select pt.type_name, count(p.id) from problem_types pt
--     left join problems p on p.type_id = pt.id group by pt.type_name order by count desc;

-- ── 문법: 조사류(주격/보조사/목적격/처소격, 1~2급) → TOPIK I · 문법 · 조사 ──
update problems set type_id = (
  select id from problem_types where level='topik1' and category='grammar' and type_number=1
) where category='grammar' and level in (1,2);

-- ── 문법: 연결어미(3~4급) → TOPIK I · 문법 · 연결어미 ──
update problems set type_id = (
  select id from problem_types where level='topik1' and category='grammar' and type_number=3
) where category='grammar' and level in (3,4);

-- ── 어휘: 한자어(5급) → TOPIK II 고급 · 어휘 · 고급 한자어 ──
update problems set type_id = (
  select id from problem_types where level='topik2_high' and category='vocabulary' and type_number=1
) where category='vocabulary' and level=5;

-- ── 어휘: 관용표현(6급) → TOPIK II 고급 · 어휘 · 관용 표현·속담 ──
update problems set type_id = (
  select id from problem_types where level='topik2_high' and category='vocabulary' and type_number=2
) where category='vocabulary' and level=6;

-- ── 어휘: 유의어/반의어(2급, 의미 관계) → TOPIK II 고급 · 어휘 · 유의어 변별 ──
-- (신규 구조에 초급 어휘 유형이 없어 의미 변별 유형으로 분배)
update problems set type_id = (
  select id from problem_types where level='topik2_high' and category='vocabulary' and type_number=3
) where category='vocabulary' and (question like '%반대말%' or question like '%비슷한 말%');

-- ── 안전망: 아직 NULL 인 문제를 카테고리 기준 기본 유형으로 매핑(미연결 0 보장) ──
update problems set type_id = (
  select id from problem_types where level='topik1' and category='grammar' and type_number=1
) where type_id is null and category='grammar';

update problems set type_id = (
  select id from problem_types where level='topik2_high' and category='vocabulary' and type_number=3
) where type_id is null and category='vocabulary';
