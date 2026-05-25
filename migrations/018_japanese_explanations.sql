-- 018: 학습 설명을 일본어로 전환 (일본인 학습자 대상)
-- 원칙: 학습 대상인 한국어 단어·조사·문법 용어는 그대로 유지(필요 시 병기),
--       안내·설명 문장만 자연스러운 일본어로 작성합니다.
-- 009 이후에 실행하세요. (멱등 UPDATE)
-- 콘텐츠에는 SQL/JSON 충돌 방지를 위해 ASCII 따옴표를 쓰지 않았습니다.

-- =====================================================================
-- (A) 그룹별 보강 텍스트(힌트/상세 해설/학습 포인트/복습) → 일본어
-- =====================================================================

-- 주격조사 이/가 (1급)
update problems set
  hint='主語の位置です。前の名詞に받침(パッチム)があれば 이、なければ 가 を使います。',
  detailed_explanation='主格助詞は文の主語を表します。前の体言に받침があれば 이、母音で終われば 가 を使います。この位置に目的格 을/를 や場所の 에 を入れると非文になります。',
  learning_point='主格助詞 이/가 の形の選び方(받침の有無)と主語を表す働き。',
  review_tip='主語の位置、받침があれば 이、なければ 가。これだけ覚えましょう。'
where category='grammar' and level=1 and correct_answer in ('이','가');

-- 보조사 은/는 (1급)
update problems set
  hint='主題・対比を表す 은/는 の位置です。받침があれば 은、なければ 는。저・나 は 가 と結びつくと 제가・내가 になります。',
  detailed_explanation='補助詞 은/는 は文の主題を示したり対比を表します。받침の後は 은、母音の後は 는 を使います。저가・나가 は非文で、それぞれ 제가・내가(主格)または 저는・나는(主題)と書きます。',
  learning_point='主題・対比の 은/는 と主格 이/가 の意味の違い。',
  review_tip='은/는 は主題と対比。저는・나는 はよいですが 저가・나가 はだめです。'
where category='grammar' and level=1 and correct_answer in ('은','는');

-- 목적격 을/를 (2급)
update problems set
  hint='動詞の目的語の位置です。받침があれば 을、なければ 를 です。',
  detailed_explanation='目的格助詞 을/를 は他動詞の対象(目的語)を表します。받침の後は 을、母音の後は 를 を使います。主格 이/가 や場所の 에/에서 は目的語の位置に来られません。',
  learning_point='他動詞の目的語を表す 을/를 の形の選び方。',
  review_tip='「何を + 動詞」。받침があれば 을、なければ 를。'
where category='grammar' and level=2 and correct_answer in ('을','를');

-- 처소격 에/에서 (2급)
update problems set
  hint='場所の助詞です。存在・到着(있다/가다)には 에、動作が行われる場所には 에서 を使います。',
  detailed_explanation='에 は存在(있다)や到着地点(가다)、時間を表します。에서 は動作が行われる場所を表します。同じ場所でも動詞の種類によって 에 と 에서 が変わります。',
  learning_point='場所の助詞 에(存在・到着・時間)と 에서(動作の場所)の区別。',
  review_tip='있다・가다 は 에、먹다・공부하다 のような動作は 에서。'
where category='grammar' and level=2 and correct_answer in ('에','에서');

-- 반의어 (2급 어휘)
update problems set
  hint='提示語と正反対の意味の語を選びましょう。似ているだけ・関連するだけの語は答えではありません。',
  detailed_explanation='반의어(反対語)は意味が正反対の語です。関連はあっても反対ではない語(例: 빠르다-늦다)を選ばないよう、意味の軸を正確に見極めましょう。',
  learning_point='基礎的な形容詞・動詞の反対語の関係。',
  review_tip='同じ意味の軸で正反対かを確認しましょう。速さは 빠르다 と 느리다、時間は 이르다 と 늦다。'
where category='vocabulary' and question like '%반대말%';

-- 유의어 (2급 어휘)
update problems set
  hint='提示語と最も意味が近い語を選びましょう。感情・程度の方向が同じである必要があります。',
  detailed_explanation='유의어(類義語)は意味がほぼ同じで言い換えられる語です。字が似ていたり同じ分類(感情など)でも、方向が違えば類義語ではありません。',
  learning_point='基礎語彙の類義関係と言い換え。',
  review_tip='文に入れて言い換えても意味が変わらなければ類義語です。'
where category='vocabulary' and question like '%비슷한 말%';

-- 연결어미 (3-4급 문법)
update problems set
  hint='前後の節の関係を見ましょう。理由なら -아/어서、並列・順序なら -고、対比なら -지만、条件なら -(으)면 です。命令・勧誘文には -아서 ではなく -(으)니까 を使います。',
  detailed_explanation='연결어미(連結語尾)は二つの節の論理関係を表します。-아/어서(理由・先行)、-고(並列・順序)、-지만(対比)、-(으)면(条件)、-(으)니까(理由、命令・勧誘と呼応)。特に命令文・勧誘文の後では -아/어서 は使えず -(으)니까 を使います。',
  learning_point='理由・並列・対比・条件の連結語尾の働きと -아서/-니까 の制約。',
  review_tip='理由は -아서、ただし後ろが命令・勧誘文なら -니까。'
where category='grammar' and level in (3,4);

-- 고급 한자어 (5급 어휘)
update problems set
  hint='漢字の形態素の意味を解いてみましょう。증가の 가(加)は加える、단축の 축(縮)は縮めるなど、字に意味が含まれています。',
  detailed_explanation='上級の漢字語は形態素の意味が分かれば推測できます。증가は増加(増えること)、단축は短縮(短く縮めること)、협력は協力(力を合わせること)、예방は予防(あらかじめ防ぐこと)、개선は改善(より良く直すこと)を意味します。',
  learning_point='時事・学術文の中心となる漢字語の意味。',
  review_tip='漢字語は形態素ごとに意味を分けると覚えやすいです。'
where category='vocabulary' and level=5;

-- 관용표현 (6급 어휘)
update problems set
  hint='字義通りではなく、定着した比喩的な意味を思い浮かべましょう。',
  detailed_explanation='慣用表現は字義ではなく慣習的に定着した意味で使われます。발이 넓다(顔が広い=知り合いが多い)、손이 크다(気前がよい)、눈이 높다(目が肥えている=基準が厳しい)、발 벗고 나서다(積極的に手を貸す)、미역국을 먹다(試験に落ちる)のように、意味をまるごと覚えましょう。',
  learning_point='身体に関する慣用表現の比喩的な意味。',
  review_tip='慣用句は字義を捨てて意味をまるごと覚えましょう。'
where category='vocabulary' and level=6;

-- =====================================================================
-- (B) 문제별 해설(explanation) + 오답 분석(wrong_answer_analysis) → 일본어
-- =====================================================================

-- ── 주격조사 ──
update problems set explanation='학생 は받침(パッチム)があり、있다 の前の主語なので主格助詞 이 を使います。',
  wrong_answer_analysis='["正解: 받침の後の主格助詞 이。","을 は目的格助詞なので主語の位置に合いません。","에 は場所・時間の助詞で主語を表しません。","를 は目的格助詞なので主語の位置に合いません。"]'::jsonb
  where question like '교실에 학생%';
update problems set explanation='날씨 は母音で終わるので主格助詞 가 を使います。',
  wrong_answer_analysis='["正解: 母音の後の主格助詞 가。","를 は目的格助詞です。","에서 は動作の場所の助詞です。","의 は所有・連体の助詞です。"]'::jsonb
  where question like '날씨%좋아요%';
update problems set explanation='비가 오다(雨が降る)が自然です。母音で終わるので 가 を使います。',
  wrong_answer_analysis='["正解: 비가 오다、母音の後の 가。","를 は目的格なので合いません。","에 は場所・時間の助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '밖에 비%';
update problems set explanation='의자 は母音で終わり、있다 の前の主語なので 가 を使います。',
  wrong_answer_analysis='["正解: 의자가、母音の後の主格 가。","을 は目的格助詞です。","에 は場所・時間の助詞です。","와 は並列・同伴の助詞です。"]'::jsonb
  where question like '여기 의자%';
update problems set explanation='선생님 は받침があるので主格助詞 이 を使います。',
  wrong_answer_analysis='["正解: 받침の後の主格助詞 이。","을 は目的格助詞です。","에게 は人を対象にする「〜に」です。","를 は目的格助詞です。"]'::jsonb
  where question like '선생님%오셨%';

-- ── 보조사 ──
update problems set explanation='저 には 는 を使います。저+가 は 제가 になるため 저가 は非文です。',
  wrong_answer_analysis='["正解: 저+는、主題の補助詞。","저+가 は 제가 になり 저가 は非文です。","을 は目的格助詞です。","에 は場所・時間の助詞です。"]'::jsonb
  where question like '저%학생입니다%';
update problems set explanation='받침の後の主題の補助詞 은 が適切です。',
  wrong_answer_analysis='["正解: 받침の後の主題の補助詞 은。","를 は目的格助詞です。","에 は場所・時間の助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '이름%무엇입니까%';
update problems set explanation='対比の 는 を使います。저+가 は 제가 なので 저가 は非文です。',
  wrong_answer_analysis='["正解: 対比の 는。","저+가 は 제가 なので 저가 は非文です。","를 は目的格助詞です。","에 は場所・時間の助詞です。"]'::jsonb
  where question like '형은 키가%';
update problems set explanation='時間の主題 오늘(받침 ㄹ)の後には 은 を使います。',
  wrong_answer_analysis='["正解: 받침(ㄹ)の後の主題の補助詞 은。","를 は目的格助詞です。","의 は連体の助詞です。","에서 は動作の場所の助詞です。"]'::jsonb
  where question like '오늘%날씨가 좋아요%';
update problems set explanation='나 には 는 を使います。나+가 は 내가 なので 나가 は非文です。',
  wrong_answer_analysis='["正解: 나+는、主題の補助詞。","나+가 は 내가 なので 나가 は非文です。","를 は目的格助詞です。","에 は場所・時間の助詞です。"]'::jsonb
  where question like '나%매일 운동%';

-- ── 목적격 ──
update problems set explanation='읽다 の目的語 책(받침)には 을 を使います。',
  wrong_answer_analysis='["正解: 読む対象 책(받침)+을。","이 は主格助詞です。","에 は場所・時間の助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '저는 매일 책%';
update problems set explanation='만나다 の目的語 친구(母音)には 를 を使います。',
  wrong_answer_analysis='["正解: 会う対象 친구(母音)+를。","가 は主格助詞です。","에서 は動作の場所の助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '어제 친구%만났%';
update problems set explanation='마시다 の目的語 물(받침)には 을 を使います。',
  wrong_answer_analysis='["正解: 飲む対象 물(받침)+을。","이 は主格助詞です。","에 は場所・時間の助詞です。","와 は並列・同伴の助詞です。"]'::jsonb
  where question like '목이 말라서%';
update problems set explanation='듣다 の目的語 음악(받침)には 을 を使います。',
  wrong_answer_analysis='["正解: 聞く対象 음악(받침)+을。","가 は主格助詞です。","에서 は動作の場所の助詞です。","에게 は人を対象にする助詞です。"]'::jsonb
  where question like '저는 음악%';
update problems set explanation='공부하다 の目的語 한국어(母音)には 를 を使います。',
  wrong_answer_analysis='["正解: 学ぶ対象 한국어(母音)+를。","가 は主格助詞です。","에 は場所・時間の助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '매일 한국어%';

-- ── 처소격 ──
update problems set explanation='가다 の到着地点には 에 を使います。',
  wrong_answer_analysis='["正解: 가다 の到着地点には 에。","에서 は動作が行われる場所に使います。","을 は目的格助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '지금 학교%가요%';
update problems set explanation='공부하다 の動作が行われる場所には 에서 を使います。',
  wrong_answer_analysis='["正解: 공부하다 の動作の場所には 에서。","에 は存在・到着地点に使います。","을 は目的格助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '도서관%공부해요%';
update problems set explanation='있다 で存在する場所には 에 を使います。',
  wrong_answer_analysis='["正解: 있다 の存在する場所には 에。","에서 は動作の場所に使います。","을 は目的格助詞です。","를 は目的格助詞です。"]'::jsonb
  where question like '동생은 지금 집%';
update problems set explanation='먹다 の動作が行われる場所には 에서 を使います。',
  wrong_answer_analysis='["正解: 먹다 の動作の場所には 에서。","에 は存在・到着地点に使います。","을 は目的格助詞です。","의 は連体の助詞です。"]'::jsonb
  where question like '식당%밥을 먹%';
update problems set explanation='時間表現の後には 에 を使います。',
  wrong_answer_analysis='["正解: 時間表現の後には 에。","에서 は動作の場所に使います。","을 は目的格助詞です。","로 は方向・手段の助詞です。"]'::jsonb
  where question like '오후 세 시%';

-- ── 반의어 ──
update problems set explanation='크다(大きい)の反対は 작다(小さい)です。',
  wrong_answer_analysis='["正解: 크다 の反対は 작다。","많다(多い)の反対は 적다(少ない)です。","높다(高い)の反対は 낮다(低い)です。","넓다(広い)の反対は 좁다(狭い)です。"]'::jsonb
  where question like '%크다%반대말%';
update problems set explanation='싸다(安い)の反対は 비싸다(高い)です。',
  wrong_answer_analysis='["正解: 싸다 の反対は 비싸다。","좋다(良い)の反対は 나쁘다(悪い)です。","빠르다(速い)の反対は 느리다(遅い)です。","멀다(遠い)の反対は 가깝다(近い)です。"]'::jsonb
  where question like '%싸다%반대말%';
update problems set explanation='덥다(暑い)の反対は 춥다(寒い)です。',
  wrong_answer_analysis='["正解: 덥다 の反対は 춥다。","뜨겁다(熱い)の反対は 차갑다(冷たい)です。","맑다(晴れ)の反対は 흐리다(曇り)です。","흐리다 は 맑다 の反対です。"]'::jsonb
  where question like '%덥다%반대말%';
update problems set explanation='빠르다(速い、速度)の反対は 느리다(遅い)です。',
  wrong_answer_analysis='["正解: 빠르다(速度)の反対は 느리다。","늦다 は時間の概念で、速度の反対ではありません。","짧다(短い)の反対は 길다(長い)です。","좁다(狭い)の反対は 넓다(広い)です。"]'::jsonb
  where question like '%빠르다%반대말%';
update problems set explanation='열다(開ける)の反対は 닫다(閉める)です。',
  wrong_answer_analysis='["正解: 열다 の反対は 닫다。","막다(ふさぐ)の反対は 뚫다(通す)です。","풀다(解く)の反対は 묶다(縛る)です。","끄다(消す)の反対は 켜다(つける)です。"]'::jsonb
  where question like '%열다%반대말%';

-- ── 유의어 ──
update problems set explanation='고맙다 と 감사하다 は同じ「ありがたい」という意味です。',
  wrong_answer_analysis='["正解: 고맙다=감사하다(ありがたい)。","미안하다 は謝罪の表現です。","괜찮다 は「大丈夫だ」の意味です。","반갑다 は再会などの喜びです。"]'::jsonb
  where question like '%고맙다%비슷한 말%';
update problems set explanation='예쁘다(きれい)の標準的な類義語は 아름답다(美しい)です。',
  wrong_answer_analysis='["正解: 예쁘다 の類義語は 아름답다。","귀엽다 は「かわいい」のニュアンスです。","착하다 は性格(やさしい)を指します。","똑똑하다 は賢さを指します。"]'::jsonb
  where question like '%예쁘다%비슷한 말%';
update problems set explanation='매우 と 아주 は「とても」を表す類義の副詞です。',
  wrong_answer_analysis='["正解: 매우=아주(とても)。","조금 は「少し」です。","가끔 は頻度(たまに)を表します。","별로 は否定と呼応します。"]'::jsonb
  where question like '%매우%비슷한 말%';
update problems set explanation='기쁘다 と 즐겁다 は肯定的な感情の類義語です。',
  wrong_answer_analysis='["正解: 기쁘다 と 즐겁다 は肯定的感情の類義語。","슬프다(悲しい)は反対の感情です。","무섭다 は恐怖です。","피곤하다 は身体の状態です。"]'::jsonb
  where question like '%기쁘다%비슷한 말%';
update problems set explanation='전부 と 모두 は「すべて」という意味です。',
  wrong_answer_analysis='["正解: 전부=모두(すべて)。","조금 は少量です。","혼자 は「一人で」を表します。","따로 は「別々に」を表します。"]'::jsonb
  where question like '%전부%비슷한 말%';

-- ── 연결어미 (3급) ──
update problems set explanation='雨が降ったことが理由なので -아/어서(와서)が適切です。',
  wrong_answer_analysis='["正解: 雨が降った理由なので -아서(와서)。","-고 は単純な並列・順序です。","-(으)면 は条件です。","-지만 は対比です。"]'::jsonb
  where question like '비가%우산을 썼%';
update problems set explanation='食べた後に磨く順次の動作なので -고(먹고)が適切です。',
  wrong_answer_analysis='["正解: 食べた後に磨く順次動作 -고。","-아서(먹어서)は理由・先行です。","-지만 は対比です。","-거나 は選択です。"]'::jsonb
  where question like '밥을%이를 닦%';
update problems set explanation='時間があったことが理由なので 있어서 が適切です。',
  wrong_answer_analysis='["正解: 時間があった理由 -아서。","없어서 は意味が反対です。","-고 は単純な並列です。","-지만 は対比です。"]'::jsonb
  where question like '시간이%영화를 봤%';
update problems set explanation='天気が良いことが理由なので 좋아서 が適切です。',
  wrong_answer_analysis='["正解: 天気が良い理由 -아서。","-고 は並列です。","-(으)면 は条件です。","-지만 は対比です。"]'::jsonb
  where question like '날씨가%산책을 했%';
update problems set explanation='勉強が合格の理由なので -아/어서(공부해서)が適切です。',
  wrong_answer_analysis='["正解: 勉強が合格の理由 -아서。","-고 は並列・順序です。","-(으)면 は条件です。","-거나 は選択です。"]'::jsonb
  where question like '열심히%시험에 합격%';

-- ── 연결어미 (4급) ──
update problems set explanation='お金がないことが理由なので 없어서 が適切です。',
  wrong_answer_analysis='["正解: お金がない理由 -아서。","있어서 は意味が反対です。","-고 は並列です。","-지만 は対比です。"]'::jsonb
  where question like '돈이%살 수 없%';
update problems set explanation='会った後に続く動作なので 만나서 が適切です。',
  wrong_answer_analysis='["正解: 会った後に続く動作 -아서。","-(으)면 は条件です。","-거나 は選択です。","-지만 は対比です。"]'::jsonb
  where question like '친구를%같이 밥%';
update problems set explanation='バスが来なかったことが理由なので 와서 が適切です。',
  wrong_answer_analysis='["正解: バスが来なかった理由 -아서。","-고 は並列です。","-(으)면 は条件です。","-아도 は譲歩です。"]'::jsonb
  where question like '버스가 안%';
update problems set explanation='命令文と共に使う理由表現は -(으)니까 です。',
  wrong_answer_analysis='["正解: 命令文と共に使う理由は -(으)니까。","-아서(바빠서)は命令・勧誘と共には使えません。","-고 は並列です。","-지만 は対比です。"]'::jsonb
  where question like '제가 지금%나중에 전화%';
update problems set explanation='열다+-(으)니까 は 여니까 となり、行動後の発見を表します。',
  wrong_answer_analysis='["正解: 열다+-(으)니까 は 여니까、行動後の発見。","-고 は単純な並列です。","-(으)면 は条件です。","-지만 は対比です。"]'::jsonb
  where question like '창문을%비가 오고%';

-- ── 고급 한자어 ──
update problems set explanation='증가(増加)は数や量が増えることを意味します。',
  wrong_answer_analysis='["正解: 증가 は増えること。","줄어듦 は減少です。","멈춤 は停止です。","사라짐 は消滅です。"]'::jsonb
  where question like '%증가%';
update problems set explanation='단축(短縮)は時間・距離を短く縮めることです。',
  wrong_answer_analysis='["正解: 단축 は短く縮めること。","길게 늘임 は延長です。","새로 만듦 は新設です。","그대로 둠 は維持です。"]'::jsonb
  where question like '%단축%';
update problems set explanation='협력(協力)は力を合わせて共に働くことです。',
  wrong_answer_analysis='["正解: 협력 は力を合わせること。","서로 다툼 は対立です。","혼자 함 は単独です。","포기함 は断念です。"]'::jsonb
  where question like '%협력%';
update problems set explanation='예방(予防)は事が起きる前にあらかじめ防ぐことです。',
  wrong_answer_analysis='["正解: 예방 はあらかじめ防ぐこと。","나중에 고침 は事後対応です。","크게 키움 は拡大です。","자세히 봄 は観察です。"]'::jsonb
  where question like '%예방%';
update problems set explanation='개선(改善)は悪い点をより良く直すことです。',
  wrong_answer_analysis='["正解: 개선 はより良く直すこと。","더 나쁘게 함 は悪化です。","없애 버림 は除去です。","그대로 둠 は維持です。"]'::jsonb
  where question like '%개선%';

-- ── 관용표현 ──
update problems set explanation='발이 넓다 は交際範囲が広く、知り合いが多いという意味です。',
  wrong_answer_analysis='["正解: 발이 넓다 は知り合いが多い。","키가 크다 は字義通りの解釈です。","돈이 많다 は 손이 크다 との混同です。","자주 걷는다 は字義に引かれた誤答です。"]'::jsonb
  where question like '%발이 넓다%';
update problems set explanation='손이 크다 は気前がよい(出費が大きい)という意味です。',
  wrong_answer_analysis='["正解: 손이 크다 は気前がよい。","힘이 세다 は字義の誤解です。","키가 크다 は無関係です。","바쁘다 は 손이 모자라다 との混同です。"]'::jsonb
  where question like '%손이 크다%';
update problems set explanation='눈이 높다 は選ぶ基準が厳しいという意味です。',
  wrong_answer_analysis='["正解: 눈이 높다 は選ぶ基準が厳しい。","시력이 좋다 は字義通りの解釈です。","키가 크다 は無関係です。","잠이 많다 は無関係です。"]'::jsonb
  where question like '%눈이 높다%';
update problems set explanation='발 벗고 나서다 は積極的に手を貸すという意味です。',
  wrong_answer_analysis='["正解: 발 벗고 나서다 は積極的に手を貸す。","맨발로 걷다 は字義通りの解釈です。","화를 내다 は無関係です。","도망가다 は正反対です。"]'::jsonb
  where question like '%발 벗고%';
update problems set explanation='미역국을 먹다 は慣用的に「試験に落ちる」という意味です。',
  wrong_answer_analysis='["正解: 미역국을 먹다 は試験に落ちる。","생일을 맞다 は 미역국 の字面からの連想による誤答です。","배가 부르다 は字義の誤解です。","요리를 하다 は無関係です。"]'::jsonb
  where question like '%미역국%';
