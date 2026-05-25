-- 작업 3: 기존 problems 50개 보강 — 힌트/상세 해설/오답 분석/학습 포인트/꿀팁 복습 + 유형 연결
-- 007, 008 실행 후에 실행하세요. (재실행 안전: 모두 멱등 UPDATE)
-- 콘텐츠에는 SQL/JSON 충돌을 피하려 ASCII 따옴표를 쓰지 않았습니다.

-- =====================================================================
-- (A) 유형 연결: 기존 문제를 008 의 유형(problem_types)에 매핑
--     - 문법 조사류(1-2급)        → TOPIK I · 문법 · 조사
--     - 문법 연결어미(3-4급)       → TOPIK I · 문법 · 연결어미
--     - 어휘 한자어(5급)           → TOPIK II 고급 · 어휘 · 고급 한자어
--     - 어휘 관용표현(6급)         → TOPIK II 고급 · 어휘 · 관용 표현·속담
--     - 어휘 반의/유의(2급)는 신규 구조에 초급 어휘 유형이 없어 미연결(기존 테스트에서만 사용)
-- =====================================================================
update problems set type_id = (select id from problem_types where level='topik1' and category='grammar' and type_number=1)
  where category='grammar' and level in (1,2);
update problems set type_id = (select id from problem_types where level='topik1' and category='grammar' and type_number=3)
  where category='grammar' and level in (3,4);
update problems set type_id = (select id from problem_types where level='topik2_high' and category='vocabulary' and type_number=1)
  where category='vocabulary' and level=5;
update problems set type_id = (select id from problem_types where level='topik2_high' and category='vocabulary' and type_number=2)
  where category='vocabulary' and level=6;

-- =====================================================================
-- (B) 그룹별 보강: 힌트 + 상세 해설 + 학습 포인트 + 꿀팁 복습
-- =====================================================================

-- 주격조사 이/가 (1급)
update problems set
  hint='빈칸은 주어 자리입니다. 앞말의 받침을 확인하세요. 받침이 있으면 이, 없으면 가입니다.',
  detailed_explanation='주격조사는 문장의 주어를 표시합니다. 앞 체언에 받침이 있으면 이, 없으면 가를 씁니다. 이 자리에 목적격 을/를이나 장소격 에를 넣으면 비문이 됩니다.',
  learning_point='주격조사 이/가의 형태 선택(받침 유무)과 주어 표시 기능',
  review_tip='주어 자리, 받침 있으면 이, 없으면 가. 이 한 줄만 기억하세요.'
where category='grammar' and level=1 and correct_answer in ('이','가');

-- 보조사 은/는 (1급)
update problems set
  hint='주제·대조를 나타내는 은/는 자리입니다. 받침이 있으면 은, 없으면 는. 저·나는 가와 만나면 제가·내가가 됩니다.',
  detailed_explanation='보조사 은/는은 문장의 주제를 제시하거나 대조를 나타냅니다. 받침 뒤에는 은, 모음 뒤에는 는을 씁니다. 저가·나가는 비문이며 각각 제가·내가(주격) 또는 저는·나는(주제)으로 써야 합니다.',
  learning_point='주제·대조의 은/는과 주격 이/가의 의미 차이',
  review_tip='은/는은 주제와 대조. 저는·나는은 되지만 저가·나가는 안 됩니다.'
where category='grammar' and level=1 and correct_answer in ('은','는');

-- 목적격 을/를 (2급)
update problems set
  hint='빈칸은 동사의 목적어 자리입니다. 받침이 있으면 을, 없으면 를입니다.',
  detailed_explanation='목적격조사 을/를은 타동사의 대상(목적어)을 표시합니다. 받침 뒤에는 을, 모음 뒤에는 를을 씁니다. 주격 이/가나 장소격 에/에서는 목적어 자리에 올 수 없습니다.',
  learning_point='타동사의 목적어를 표시하는 을/를의 형태 선택',
  review_tip='무엇을 + 동사. 받침 있으면 을, 없으면 를.'
where category='grammar' and level=2 and correct_answer in ('을','를');

-- 처소격 에/에서 (2급)
update problems set
  hint='장소 조사입니다. 존재·도착(있다/가다)에는 에, 동작이 일어나는 곳에는 에서를 씁니다.',
  detailed_explanation='에는 존재(있다)나 도착 지점(가다), 시간을 나타냅니다. 에서는 동작이 일어나는 장소를 나타냅니다. 같은 장소라도 동사의 종류에 따라 에와 에서가 갈립니다.',
  learning_point='장소 조사 에(존재·도착·시간)와 에서(동작 장소)의 구분',
  review_tip='있다·가다는 에, 먹다·공부하다 같은 동작은 에서.'
where category='grammar' and level=2 and correct_answer in ('에','에서');

-- 반의어 (2급 어휘)
update problems set
  hint='제시어와 정반대 의미의 단어를 찾으세요. 비슷하거나 관련만 있는 단어는 답이 아닙니다.',
  detailed_explanation='반의어는 의미가 정확히 반대인 단어입니다. 관련은 있지만 반대가 아닌 단어(예: 빠르다-늦다)를 고르지 않도록 의미 축을 정확히 따져야 합니다.',
  learning_point='기초 형용사·동사의 반의 관계',
  review_tip='같은 의미 축에서 정반대인지 확인하세요. 속도는 빠르다와 느리다, 시간은 이르다와 늦다.'
where category='vocabulary' and question like '%반대말%';

-- 유의어 (2급 어휘)
update problems set
  hint='제시어와 의미가 가장 비슷한 단어를 찾으세요. 감정·정도의 방향이 같아야 합니다.',
  detailed_explanation='유의어는 의미가 거의 같아 바꿔 쓸 수 있는 단어입니다. 글자가 비슷하거나 같은 분류(감정 등)에 속해도 방향이 다르면 유의어가 아닙니다.',
  learning_point='기초 어휘의 유의 관계와 바꿔 쓰기',
  review_tip='문장에 넣어 바꿔도 뜻이 그대로면 유의어입니다.'
where category='vocabulary' and question like '%비슷한 말%';

-- 연결어미 (3-4급 문법)
update problems set
  hint='앞뒤 절의 관계를 보세요. 이유면 -아/어서, 나열·순서면 -고, 대조면 -지만, 조건이면 -(으)면입니다. 명령·청유문에는 -아서 대신 -(으)니까를 씁니다.',
  detailed_explanation='연결어미는 두 절의 논리 관계를 나타냅니다. -아/어서(이유·선행), -고(나열·순서), -지만(대조), -(으)면(조건), -(으)니까(이유, 명령·청유와 호응). 특히 명령문·청유문 뒤에는 -아/어서를 쓸 수 없고 -(으)니까를 써야 합니다.',
  learning_point='이유·나열·대조·조건 연결어미의 기능과 -아서/-니까 제약',
  review_tip='이유는 -아서, 단 뒤가 명령·청유문이면 -니까.'
where category='grammar' and level in (3,4);

-- 고급 한자어 (5급 어휘)
update problems set
  hint='한자 형태소의 뜻을 풀어 보세요. 증가의 가(加)는 더함, 단축의 축(縮)은 줄임처럼 글자에 뜻이 들어 있습니다.',
  detailed_explanation='고급 한자어는 형태소의 뜻을 알면 의미를 추론할 수 있습니다. 증가는 늘어남, 단축은 짧게 줄임, 협력은 힘을 합침, 예방은 미리 막음, 개선은 더 좋게 고침을 뜻합니다.',
  learning_point='시사·학술 글의 핵심 한자어 의미',
  review_tip='한자어는 형태소 단위로 뜻을 쪼개면 외우기 쉽습니다.'
where category='vocabulary' and level=5;

-- 관용표현 (6급 어휘)
update problems set
  hint='글자 그대로가 아니라 굳어진 비유적 의미를 떠올리세요.',
  detailed_explanation='관용 표현은 글자 뜻이 아닌 관습적으로 굳어진 의미로 쓰입니다. 발이 넓다는 교제 범위가 넓다, 손이 크다는 씀씀이가 후하다, 눈이 높다는 기준이 까다롭다, 발 벗고 나서다는 적극적으로 돕다, 미역국을 먹다는 시험에 떨어지다를 뜻합니다.',
  learning_point='신체 관련 관용 표현의 비유적 의미',
  review_tip='관용구는 글자 뜻을 버리고 의미를 통째로 외우세요.'
where category='vocabulary' and level=6;

-- =====================================================================
-- (C) 문제별 오답 분석 (options 순서에 1:1 대응하는 4개 항목)
-- =====================================================================

-- ── 주격조사 ──
update problems set wrong_answer_analysis='["정답: 받침 뒤 주격조사 이.","을은 목적격조사라 주어 자리에 안 맞습니다.","에는 장소·시간 조사로 주어를 표시하지 않습니다.","를은 목적격조사라 주어 자리에 안 맞습니다."]'::jsonb where question like '교실에 학생%';
update problems set wrong_answer_analysis='["정답: 모음 뒤 주격조사 가.","를은 목적격조사입니다.","에서는 동작 장소 조사입니다.","의는 소유·관형격 조사입니다."]'::jsonb where question like '날씨%좋아요%';
update problems set wrong_answer_analysis='["정답: 비가 오다, 모음 뒤 가.","를은 목적격이라 안 맞습니다.","에는 장소·시간 조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '밖에 비%';
update problems set wrong_answer_analysis='["정답: 의자가, 모음 뒤 주격 가.","을은 목적격조사입니다.","에는 장소·시간 조사입니다.","와는 나열·동반 조사입니다."]'::jsonb where question like '여기 의자%';
update problems set wrong_answer_analysis='["정답: 받침 뒤 주격조사 이.","을은 목적격조사입니다.","에게는 사람 대상에게를 뜻합니다.","를은 목적격조사입니다."]'::jsonb where question like '선생님%오셨%';

-- ── 보조사 ──
update problems set wrong_answer_analysis='["정답: 저+는, 주제 보조사.","저+가는 제가가 되어 저가는 비문입니다.","을은 목적격조사입니다.","에는 장소·시간 조사입니다."]'::jsonb where question like '저%학생입니다%';
update problems set wrong_answer_analysis='["정답: 받침 뒤 주제 보조사 은.","를은 목적격조사입니다.","에는 장소·시간 조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '이름%무엇입니까%';
update problems set wrong_answer_analysis='["정답: 대조의 는.","저+가는 제가라서 저가는 비문입니다.","를은 목적격조사입니다.","에는 장소·시간 조사입니다."]'::jsonb where question like '형은 키가%';
update problems set wrong_answer_analysis='["정답: 받침(ㄹ) 뒤 주제 보조사 은.","를은 목적격조사입니다.","의는 관형격 조사입니다.","에서는 동작 장소 조사입니다."]'::jsonb where question like '오늘%날씨가 좋아요%';
update problems set wrong_answer_analysis='["정답: 나+는, 주제 보조사.","나+가는 내가라서 나가는 비문입니다.","를은 목적격조사입니다.","에는 장소·시간 조사입니다."]'::jsonb where question like '나%매일 운동%';

-- ── 목적격 ──
update problems set wrong_answer_analysis='["정답: 읽다의 목적어 책(받침)+을.","이는 주격조사입니다.","에는 장소·시간 조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '저는 매일 책%';
update problems set wrong_answer_analysis='["정답: 만나다의 목적어 친구(모음)+를.","가는 주격조사입니다.","에서는 동작 장소 조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '어제 친구%만났%';
update problems set wrong_answer_analysis='["정답: 마시다의 목적어 물(받침)+을.","이는 주격조사입니다.","에는 장소·시간 조사입니다.","와는 나열·동반 조사입니다."]'::jsonb where question like '목이 말라서%';
update problems set wrong_answer_analysis='["정답: 듣다의 목적어 음악(받침)+을.","가는 주격조사입니다.","에서는 동작 장소 조사입니다.","에게는 사람 대상 조사입니다."]'::jsonb where question like '저는 음악%';
update problems set wrong_answer_analysis='["정답: 공부하다의 목적어 한국어(모음)+를.","가는 주격조사입니다.","에는 장소·시간 조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '매일 한국어%';

-- ── 처소격 ──
update problems set wrong_answer_analysis='["정답: 가다의 도착 지점에는 에.","에서는 동작이 일어나는 장소에 씁니다.","을은 목적격조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '지금 학교%가요%';
update problems set wrong_answer_analysis='["정답: 공부하다 동작 장소에는 에서.","에는 존재·도착 지점에 씁니다.","을은 목적격조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '도서관%공부해요%';
update problems set wrong_answer_analysis='["정답: 있다의 존재 장소에는 에.","에서는 동작 장소에 씁니다.","을은 목적격조사입니다.","를은 목적격조사입니다."]'::jsonb where question like '동생은 지금 집%';
update problems set wrong_answer_analysis='["정답: 먹다 동작 장소에는 에서.","에는 존재·도착 지점에 씁니다.","을은 목적격조사입니다.","의는 관형격 조사입니다."]'::jsonb where question like '식당%밥을 먹%';
update problems set wrong_answer_analysis='["정답: 시간 표현 뒤에는 에.","에서는 동작 장소에 씁니다.","을은 목적격조사입니다.","로는 방향·수단 조사입니다."]'::jsonb where question like '오후 세 시%';

-- ── 반의어 ──
update problems set wrong_answer_analysis='["정답: 크다의 반대는 작다.","많다의 반대는 적다입니다.","높다의 반대는 낮다입니다.","넓다의 반대는 좁다입니다."]'::jsonb where question like '%크다%반대말%';
update problems set wrong_answer_analysis='["정답: 싸다의 반대는 비싸다.","좋다의 반대는 나쁘다입니다.","빠르다의 반대는 느리다입니다.","멀다의 반대는 가깝다입니다."]'::jsonb where question like '%싸다%반대말%';
update problems set wrong_answer_analysis='["정답: 덥다의 반대는 춥다.","뜨겁다의 반대는 차갑다입니다.","맑다의 반대는 흐리다입니다.","흐리다는 맑다의 반대입니다."]'::jsonb where question like '%덥다%반대말%';
update problems set wrong_answer_analysis='["정답: 빠르다(속도)의 반대는 느리다.","늦다는 시간 개념이라 속도의 반대가 아닙니다.","짧다의 반대는 길다입니다.","좁다의 반대는 넓다입니다."]'::jsonb where question like '%빠르다%반대말%';
update problems set wrong_answer_analysis='["정답: 열다의 반대는 닫다.","막다의 반대는 뚫다입니다.","풀다의 반대는 묶다입니다.","끄다의 반대는 켜다입니다."]'::jsonb where question like '%열다%반대말%';

-- ── 유의어 ──
update problems set wrong_answer_analysis='["정답: 고맙다는 감사하다와 같은 뜻.","미안하다는 사과 표현입니다.","괜찮다는 무방하다는 뜻입니다.","반갑다는 만남의 기쁨입니다."]'::jsonb where question like '%고맙다%비슷한 말%';
update problems set wrong_answer_analysis='["정답: 예쁘다의 표준 유의어는 아름답다.","귀엽다는 사랑스럽다는 어감입니다.","착하다는 성품을 가리킵니다.","똑똑하다는 영리함을 가리킵니다."]'::jsonb where question like '%예쁘다%비슷한 말%';
update problems set wrong_answer_analysis='["정답: 매우는 아주와 같은 강조 부사.","조금은 적은 정도입니다.","가끔은 빈도를 나타냅니다.","별로는 부정과 호응합니다."]'::jsonb where question like '%매우%비슷한 말%';
update problems set wrong_answer_analysis='["정답: 기쁘다와 즐겁다는 긍정 감정 유의어.","슬프다는 반대 감정입니다.","무섭다는 두려움입니다.","피곤하다는 신체 상태입니다."]'::jsonb where question like '%기쁘다%비슷한 말%';
update problems set wrong_answer_analysis='["정답: 전부는 모두와 같은 뜻.","조금은 적은 양입니다.","혼자는 단독을 뜻합니다.","따로는 분리를 뜻합니다."]'::jsonb where question like '%전부%비슷한 말%';

-- ── 연결어미 (3급) ──
update problems set wrong_answer_analysis='["정답: 비가 온 것이 이유라 -아서(와서).","-고는 단순 나열·순서입니다.","-(으)면은 조건입니다.","-지만은 대조입니다."]'::jsonb where question like '비가%우산을 썼%';
update problems set wrong_answer_analysis='["정답: 먹은 뒤 닦는 순차 동작 -고.","-아서(먹어서)는 이유·선행입니다.","-지만은 대조입니다.","-거나는 선택입니다."]'::jsonb where question like '밥을%이를 닦%';
update problems set wrong_answer_analysis='["정답: 시간이 있던 것이 이유 -아서.","없어서는 의미가 반대입니다.","-고는 단순 나열입니다.","-지만은 대조입니다."]'::jsonb where question like '시간이%영화를 봤%';
update problems set wrong_answer_analysis='["정답: 날씨가 좋은 것이 이유 -아서.","-고는 나열입니다.","-(으)면은 조건입니다.","-지만은 대조입니다."]'::jsonb where question like '날씨가%산책을 했%';
update problems set wrong_answer_analysis='["정답: 공부가 합격의 이유 -아서.","-고는 나열·순서입니다.","-(으)면은 조건입니다.","-거나는 선택입니다."]'::jsonb where question like '열심히%시험에 합격%';

-- ── 연결어미 (4급) ──
update problems set wrong_answer_analysis='["정답: 돈이 없는 것이 이유 -아서.","있어서는 의미가 반대입니다.","-고는 나열입니다.","-지만은 대조입니다."]'::jsonb where question like '돈이%살 수 없%';
update problems set wrong_answer_analysis='["정답: 만난 뒤 이어지는 동작 -아서.","-(으)면은 조건입니다.","-거나는 선택입니다.","-지만은 대조입니다."]'::jsonb where question like '친구를%같이 밥%';
update problems set wrong_answer_analysis='["정답: 버스가 안 온 것이 이유 -아서.","-고는 나열입니다.","-(으)면은 조건입니다.","-아도는 양보입니다."]'::jsonb where question like '버스가 안%';
update problems set wrong_answer_analysis='["정답: 명령문과 함께 쓰는 이유는 -(으)니까.","-아서(바빠서)는 명령·청유와 함께 못 씁니다.","-고는 나열입니다.","-지만은 대조입니다."]'::jsonb where question like '제가 지금%나중에 전화%';
update problems set wrong_answer_analysis='["정답: 열다+-(으)니까는 여니까, 행동 후 발견.","-고는 단순 나열입니다.","-(으)면은 조건입니다.","-지만은 대조입니다."]'::jsonb where question like '창문을%비가 오고%';

-- ── 고급 한자어 ──
update problems set wrong_answer_analysis='["정답: 증가는 늘어남.","줄어듦은 감소입니다.","멈춤은 정지입니다.","사라짐은 소멸입니다."]'::jsonb where question like '%증가%';
update problems set wrong_answer_analysis='["정답: 단축은 짧게 줄임.","길게 늘임은 연장입니다.","새로 만듦은 신설입니다.","그대로 둠은 유지입니다."]'::jsonb where question like '%단축%';
update problems set wrong_answer_analysis='["정답: 협력은 힘을 합침.","서로 다툼은 대립입니다.","혼자 함은 독자입니다.","포기함은 단념입니다."]'::jsonb where question like '%협력%';
update problems set wrong_answer_analysis='["정답: 예방은 미리 막음.","나중에 고침은 사후 대응입니다.","크게 키움은 확대입니다.","자세히 봄은 관찰입니다."]'::jsonb where question like '%예방%';
update problems set wrong_answer_analysis='["정답: 개선은 더 좋게 고침.","더 나쁘게 함은 악화입니다.","없애 버림은 제거입니다.","그대로 둠은 유지입니다."]'::jsonb where question like '%개선%';

-- ── 관용표현 ──
update problems set wrong_answer_analysis='["정답: 발이 넓다는 교제 범위가 넓다.","키가 크다는 글자 그대로의 해석입니다.","돈이 많다는 손이 크다와 혼동된 것입니다.","자주 걷는다는 글자 뜻에 이끌린 오답입니다."]'::jsonb where question like '%발이 넓다%';
update problems set wrong_answer_analysis='["정답: 손이 크다는 씀씀이가 후하다.","힘이 세다는 글자 뜻 오해입니다.","키가 크다는 무관합니다.","바쁘다는 손이 모자라다와 혼동입니다."]'::jsonb where question like '%손이 크다%';
update problems set wrong_answer_analysis='["정답: 눈이 높다는 고르는 기준이 까다롭다.","시력이 좋다는 글자 그대로의 해석입니다.","키가 크다는 무관합니다.","잠이 많다는 무관합니다."]'::jsonb where question like '%눈이 높다%';
update problems set wrong_answer_analysis='["정답: 발 벗고 나서다는 적극적으로 돕다.","맨발로 걷다는 글자 그대로의 해석입니다.","화를 내다는 무관합니다.","도망가다는 정반대입니다."]'::jsonb where question like '%발 벗고%';
update problems set wrong_answer_analysis='["정답: 미역국을 먹다는 시험에 떨어지다.","생일을 맞다는 미역국의 글자 연상 오답입니다.","배가 부르다는 글자 뜻 오해입니다.","요리를 하다는 무관합니다."]'::jsonb where question like '%미역국%';
