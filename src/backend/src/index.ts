import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { publicCache } from './middleware/cache';

import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import problemsRoutes from './routes/problems';
import problemTypesRoutes from './routes/problemTypes';
import vocabularyRoutes from './routes/vocabulary';
import submissionsRoutes from './routes/submissions';
import postsRoutes from './routes/posts';
import commentsRoutes from './routes/comments';
import progressRoutes from './routes/progress';
import searchRoutes from './routes/search';
import bookmarksRoutes from './routes/bookmarks';
import notificationsRoutes from './routes/notifications';
import leaderboardRoutes from './routes/leaderboard';
import usersRoutes from './routes/users';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'topik-master-backend' });
});

app.use('/api/auth', authRoutes);
// 공개 읽기 라우트는 짧은 캐시를 적용
app.use('/api/courses', publicCache(120), coursesRoutes);
app.use('/api/problem-types', publicCache(120), problemTypesRoutes);
app.use('/api/vocabulary', publicCache(300), vocabularyRoutes);
app.use('/api/problems', publicCache(120), problemsRoutes);
app.use('/api/search', publicCache(30), searchRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', usersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(env.PORT);
app.listen(port, () => {
  console.log(`🚀 TOPIK 마스터 백엔드 실행 중: http://localhost:${port}`);
  console.log(`   CORS 허용 오리진: ${env.FRONTEND_URL}`);
});

export default app;
