import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { signToken } from '../utils/jwt';

const router = Router();

/** POST /api/auth/signup */
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body as {
      email?: string;
      password?: string;
      username?: string;
    };

    if (!email || !password || !username) {
      throw new AppError('이메일, 비밀번호, 닉네임을 모두 입력해주세요.', 400);
    }
    if (password.length < 6) {
      throw new AppError('비밀번호는 6자 이상이어야 합니다.', 400);
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new AppError('이미 가입된 이메일입니다.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash, username })
      .select('id, email, username, created_at')
      .single();

    if (error || !user) {
      throw new AppError(error?.message ?? '회원가입에 실패했습니다.', 500);
    }

    // 기본 프로필/진행도 행 생성 (실패해도 가입 자체는 성공 처리)
    await supabase.from('user_profiles').insert({ user_id: user.id });

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ success: true, data: { user, token } });
  })
);

/** POST /api/auth/login */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new AppError('이메일과 비밀번호를 입력해주세요.', 400);
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    const token = signToken({ userId: user.id, email: user.email });
    const { password_hash, ...safeUser } = user;
    void password_hash;

    res.json({ success: true, data: { user: safeUser, token } });
  })
);

export default router;
