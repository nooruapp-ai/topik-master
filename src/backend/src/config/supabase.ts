import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// createClient 는 유효하지 않은 URL 이면 throw 하므로, 미설정 시 placeholder 를 사용해
// 서버가 부팅(및 typecheck)될 수 있게 합니다. 실제 쿼리는 에러를 반환합니다.
export const supabase = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.SUPABASE_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
