import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: process.env.PORT ?? '5000',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  // publishable/anon 키 (호환용 폴백)
  SUPABASE_KEY: process.env.SUPABASE_KEY ?? '',
  // 서버 전용 secret 키 (RLS 우회) — 백엔드는 이 키를 우선 사용합니다.
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
};

// 백엔드는 RLS 를 우회해야 하는 서버 작업(가입 시 users insert 등)을 수행하므로
// service_role(secret) 키를 우선 사용하고, 없으면 SUPABASE_KEY 로 폴백합니다.
export const supabaseServerKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(env.SUPABASE_URL && supabaseServerKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[env] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY(또는 SUPABASE_KEY) 가 설정되지 않았습니다. ' +
      '.env 파일을 확인하세요. (데이터베이스 연동 요청은 실패합니다)'
  );
} else if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[env] SUPABASE_SERVICE_ROLE_KEY 가 없어 publishable/anon 키로 폴백합니다. ' +
      'RLS 가 켜진 테이블에서는 서버 작업이 실패할 수 있습니다.'
  );
}
