import { createClient } from '@supabase/supabase-js';
import { env, supabaseServerKey } from './env';

// createClient 는 유효하지 않은 URL 이면 throw 하므로, 미설정 시 placeholder 를 사용해
// 서버가 부팅(및 typecheck)될 수 있게 합니다. 실제 쿼리는 에러를 반환합니다.
// supabaseServerKey: service_role(secret) 키 우선, 없으면 SUPABASE_KEY 폴백.
export const supabase = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  supabaseServerKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
