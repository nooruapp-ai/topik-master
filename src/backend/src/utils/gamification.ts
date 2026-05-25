import { supabase } from '../config/supabase';

/** XP 100당 1레벨 (레벨 = floor(points / 100) + 1) */
export function levelForPoints(points: number): number {
  return Math.floor(points / 100) + 1;
}

/** 사용자에게 XP 적립 + 레벨 재계산. 게임화는 best-effort 이므로 내부에서 throw 하지 않습니다. */
export async function awardXp(userId: string, amount: number): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();

    const points = (profile?.total_points ?? 0) + amount;
    const level = levelForPoints(points);

    if (profile) {
      await supabase
        .from('user_profiles')
        .update({ total_points: points, level })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_profiles')
        .insert({ user_id: userId, total_points: points, level });
    }
  } catch {
    /* best-effort */
  }
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * 제출 기록의 연속 활동일로 스트릭을 재계산합니다.
 * 오늘(없으면 어제)부터 하루씩 거슬러 올라가며 연속 일수를 셉니다.
 */
export async function recomputeStreak(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('submissions')
      .select('submitted_at')
      .eq('user_id', userId);

    const days = new Set((data ?? []).map((s) => ymd(new Date(s.submitted_at as string))));

    let streak = 0;
    const cursor = new Date();
    if (!days.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(ymd(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    await supabase.from('user_profiles').update({ current_streak: streak }).eq('user_id', userId);
    return streak;
  } catch {
    return 0;
  }
}
