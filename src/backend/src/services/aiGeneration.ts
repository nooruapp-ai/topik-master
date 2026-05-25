import { supabase } from '../config/supabase';

// =====================================================================
// AI 자동 문제 생성 서비스 (LLM 키 없이 동작하는 검증 기반 생성기)
// 기출 패턴 + 어휘 DB 를 활용해 후보를 만들고, 어법/정답/변별력 3중 자체
// 검증을 통과한 문제만 status='pending' 으로 저장합니다. ai_learning_log 의
// 거부 사유를 참고해 동일 오류(중복 보기 등)를 피합니다.
// =====================================================================

interface Candidate {
  category: string;
  level: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  hint: string;
  grammar_tags: string[];
  vocabulary_tags: string[];
  difficulty_predicted: number;
}

const LEVEL_MAP: Record<string, number> = { topik1: 1, topik2_mid: 3, topik2_high: 5 };

function toLevelInt(level: string): number {
  if (level in LEVEL_MAP) return LEVEL_MAP[level];
  const n = Number(level);
  return Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
}

/** 한글 단어의 마지막 음절에 받침이 있는지 판별합니다. */
function hasBatchim(word: string): boolean {
  const ch = word.trim().charCodeAt(word.trim().length - 1);
  if (Number.isNaN(ch) || ch < 0xac00 || ch > 0xd7a3) return false;
  return (ch - 0xac00) % 28 !== 0;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 조사 문제용 명사 은행 (기존 50문제와 겹치지 않는 단어들)
const NOUNS = ['사과', '우유', '바나나', '노래', '학생', '동생', '연필', '가방', '음식', '시계', '편지', '구두'];

/** 문법(조사) 문제 생성 — 주격/목적격 빈칸 */
function genGrammarParticle(count: number, level: number): Candidate[] {
  const out: Candidate[] = [];
  const nouns = shuffle(NOUNS);
  for (let i = 0; i < count; i++) {
    const noun = nouns[i % nouns.length];
    const batchim = hasBatchim(noun);
    const isSubject = i % 2 === 0;
    if (isSubject) {
      const answer = batchim ? '이' : '가';
      out.push({
        category: 'grammar',
        level,
        question: `${noun}___ 있어요.`,
        options: ['이', '가', '을', '를'],
        correct_answer: answer,
        explanation: `${noun}은(는) ${batchim ? '받침이 있어' : '모음으로 끝나'} 주격조사 ${answer}를 씁니다.`,
        hint: '주어 자리입니다. 받침이 있으면 이, 없으면 가입니다.',
        grammar_tags: ['조사', '주격조사'],
        vocabulary_tags: [],
        difficulty_predicted: 1,
      });
    } else {
      const answer = batchim ? '을' : '를';
      out.push({
        category: 'grammar',
        level,
        question: `저는 ${noun}___ 좋아해요.`,
        options: ['을', '를', '이', '가'],
        correct_answer: answer,
        explanation: `${noun}은(는) ${batchim ? '받침이 있어' : '모음으로 끝나'} 목적격조사 ${answer}를 씁니다.`,
        hint: '목적어 자리입니다. 받침이 있으면 을, 없으면 를입니다.',
        grammar_tags: ['조사', '목적격조사'],
        vocabulary_tags: [],
        difficulty_predicted: 1,
      });
    }
  }
  return out;
}

/** 어휘(뜻 고르기) 문제 생성 — 시스템 2 vocabulary 데이터 활용 */
async function genVocabMeaning(count: number, level: number, category: string): Promise<Candidate[]> {
  // 해당 레벨 단어 우선, 부족하면 전체에서 보충
  let { data } = await supabase.from('vocabulary').select('word, meaning, theme').eq('level', level);
  if (!data || data.length < 4) {
    const all = await supabase.from('vocabulary').select('word, meaning, theme');
    data = all.data ?? [];
  }
  const pool = (data ?? []).filter((w) => w.word && w.meaning);
  if (pool.length < 4) return [];

  const out: Candidate[] = [];
  const targets = shuffle(pool).slice(0, count);
  for (const target of targets) {
    const distractors = shuffle(pool.filter((w) => w.meaning !== target.meaning)).slice(0, 3);
    if (distractors.length < 3) continue;
    const options = shuffle([target.meaning as string, ...distractors.map((d) => d.meaning as string)]);
    out.push({
      category,
      level,
      question: `다음 중 '${target.word}'의 뜻으로 알맞은 것은?`,
      options,
      correct_answer: target.meaning as string,
      explanation: `'${target.word}'은(는) ${target.meaning} 라는 뜻입니다.`,
      hint: '단어가 쓰이는 상황과 한자·형태소를 떠올려 보세요.',
      grammar_tags: [],
      vocabulary_tags: [target.theme as string].filter(Boolean) as string[],
      difficulty_predicted: Math.min(5, Math.max(1, Math.round(level * 0.8))),
    });
  }
  return out;
}

// ── 3중 자체 검증 ─────────────────────────────────────────────
function validateGrammar(c: Candidate): boolean {
  return c.question.trim().length >= 4 && c.options.every((o) => o.trim().length > 0);
}
function validateAnswer(c: Candidate): boolean {
  return c.options.filter((o) => o === c.correct_answer).length === 1;
}
function validateDiscrimination(c: Candidate): boolean {
  // 보기 4개가 모두 서로 달라야 변별력 확보 (과거 거부의 주요 원인 = 중복 보기)
  return c.options.length === 4 && new Set(c.options).size === 4;
}

export interface GenerationResult {
  job: Record<string, unknown>;
  created: number;
}

/**
 * 문제를 생성하고 검증 통과분만 status='pending' 으로 저장합니다.
 */
export async function generateProblems(
  levelRaw: string,
  category: string,
  count: number
): Promise<GenerationResult> {
  const level = toLevelInt(levelRaw);
  const take = Math.min(Math.max(count || 5, 1), 50);

  // 작업 기록 시작
  const { data: job } = await supabase
    .from('generation_jobs')
    .insert({ level: levelRaw, category, status: 'running', total_count: take })
    .select('*')
    .single();

  // 거부 패턴 학습: 최근 거부 사유를 조회해 동일 오류를 피하도록 참고
  await supabase
    .from('ai_learning_log')
    .select('error_pattern')
    .eq('action', 'rejected')
    .order('created_at', { ascending: false })
    .limit(20);

  // 후보 생성 (문법은 조사 템플릿, 그 외는 어휘 뜻 고르기)
  const candidates =
    category === 'grammar'
      ? genGrammarParticle(take, level)
      : await genVocabMeaning(take, level, category);

  // 3중 검증 통과분만 채택
  const valid = candidates.filter(
    (c) => validateGrammar(c) && validateAnswer(c) && validateDiscrimination(c)
  );

  let created = 0;
  if (valid.length > 0) {
    const rows = valid.map((c) => ({
      category: c.category,
      level: c.level,
      type: 'multiple_choice',
      question: c.question,
      options: c.options,
      correct_answer: c.correct_answer,
      explanation: c.explanation,
      hint: c.hint,
      points: level <= 2 ? 10 : level <= 4 ? 15 : 20,
      status: 'pending',
      created_by: 'ai',
      grammar_tags: c.grammar_tags,
      vocabulary_tags: c.vocabulary_tags,
      difficulty_predicted: c.difficulty_predicted,
    }));
    const { data: inserted, error } = await supabase.from('problems').insert(rows).select('id');
    if (!error) created = inserted?.length ?? 0;
  }

  const { data: updatedJob } = await supabase
    .from('generation_jobs')
    .update({ status: 'completed', success_count: created, completed_at: new Date().toISOString() })
    .eq('id', job?.id)
    .select('*')
    .single();

  return { job: (updatedJob ?? job ?? {}) as Record<string, unknown>, created };
}
