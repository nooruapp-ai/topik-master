import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import problemsRoutes from './routes/problems';
import submissionsRoutes from './routes/submissions';
import postsRoutes from './routes/posts';
import commentsRoutes from './routes/comments';
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
app.use('/api/courses', coursesRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
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
