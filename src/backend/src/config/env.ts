import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT ?? '5000',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_KEY: process.env.SUPABASE_KEY ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
};

export const isSupabaseConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    '[env] SUPABASE_URL / SUPABASE_KEY 가 설정되지 않았습니다. .env 파일을 확인하세요. ' +
      '(데이터베이스 연동 요청은 실패합니다)'
  );
}
