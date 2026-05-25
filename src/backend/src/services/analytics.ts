import { supabase } from '../config/supabase';

export interface TagStat {
  tag: string;
  total: number;
  wrong: number;
}

export interface CategoryStat {
  category: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface Weaknesses {
  weak_grammar: TagStat[];
  weak_vocabulary: TagStat[];
  weak_categories: CategoryStat[];
  strong_areas: CategoryStat[];
  last_updated: string;
}

interface JoinedProblem {
  category?: string | null;
  grammar_tags?: string[] | null;
  vocabulary_tags?: string[] | null;
}

/**
 * 사용자의 제출 내역을 분석해 약점/강점을 계산하고 user_weaknesses 에 캐시합니다.
 * problems 의 grammar_tags/vocabulary_tags 를 오답 기준으로 집계합니다.
 */
export async function computeWeaknesses(userId: string): Promise<Weaknesses> {
  const { data } = await supabase
    .from('submissions')
    .select('is_correct, problem:problems(category, grammar_tags, vocabulary_tags)')
    .eq('user_id', userId);

  const subs = data ?? [];
  const grammar = new Map<string, TagStat>();
  const vocabulary = new Map<string, TagStat>();
  const categories = new Map<string, { total: number; correct: number }>();

  const bump = (map: Map<string, TagStat>, tag: string, wrong: boolean) => {
    const e = map.get(tag) ?? { tag, total: 0, wrong: 0 };
    e.total += 1;
    if (wrong) e.wrong += 1;
    map.set(tag, e);
  };

  for (const s of subs) {
    const p = (s.problem ?? null) as JoinedProblem | null;
    if (!p) continue;
    const wrong = !s.is_correct;
    for (const tag of p.grammar_tags ?? []) bump(grammar, tag, wrong);
    for (const tag of p.vocabulary_tags ?? []) bump(vocabulary, tag, wrong);
    const c = p.category ?? 'unknown';
    const ce = categories.get(c) ?? { total: 0, correct: 0 };
    ce.total += 1;
    if (!wrong) ce.correct += 1;
    categories.set(c, ce);
  }

  const weak_grammar = [...grammar.values()].filter((t) => t.wrong > 0).sort((a, b) => b.wrong - a.wrong);
  const weak_vocabulary = [...vocabulary.values()].filter((t) => t.wrong > 0).sort((a, b) => b.wrong - a.wrong);

  const catStats: CategoryStat[] = [...categories.entries()].map(([category, v]) => ({
    category,
    total: v.total,
    correct: v.correct,
    accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
  }));
  const weak_categories = catStats.filter((c) => c.total > 0).sort((a, b) => a.accuracy - b.accuracy);
  const strong_areas = catStats
    .filter((c) => c.total > 0 && c.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy);

  const last_updated = new Date().toISOString();

  // 캐시 갱신 (best-effort, 실패해도 결과는 반환)
  await supabase.from('user_weaknesses').upsert(
    { user_id: userId, weak_grammar, weak_vocabulary, weak_categories, strong_areas, last_updated },
    { onConflict: 'user_id' }
  );

  return { weak_grammar, weak_vocabulary, weak_categories, strong_areas, last_updated };
}

/**
 * 약점 영역(가장 정답률이 낮은 카테고리) 우선으로 승인된 문제를 추천합니다.
 */
export async function recommendProblems(userId: string, limit = 5) {
  const w = await computeWeaknesses(userId);
  const weakCategory = w.weak_categories[0]?.category;

  let query = supabase.from('problems').select('*').eq('status', 'approved');
  if (weakCategory && weakCategory !== 'unknown') query = query.eq('category', weakCategory);

  const { data } = await query.limit(limit);
  return { weak_category: weakCategory ?? null, problems: data ?? [] };
}
