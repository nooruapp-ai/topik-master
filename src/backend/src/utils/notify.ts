import { supabase } from '../config/supabase';

type NotificationType = 'like' | 'comment' | 'friend_request';

interface NotifyParams {
  userId: string; // 받는 사람
  actorId?: string; // 발생시킨 사람
  type: NotificationType;
  targetType?: string;
  targetId?: string;
  message?: string;
}

/** 알림 생성 (best-effort). 자기 자신에게는 알리지 않으며, 실패해도 throw 하지 않습니다. */
export async function createNotification(params: NotifyParams): Promise<void> {
  try {
    if (params.actorId && params.actorId === params.userId) return;
    await supabase.from('notifications').insert({
      user_id: params.userId,
      actor_id: params.actorId ?? null,
      type: params.type,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      message: params.message ?? null,
    });
  } catch {
    /* best-effort */
  }
}
