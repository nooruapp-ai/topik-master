import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Spinner from './components/Spinner';

// 페이지는 라우트 단위로 코드 스플리팅하여 초기 번들 크기를 줄입니다.
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Home = lazy(() => import('./pages/Home'));
// 학습 구조 개편: 레벨 → 영역 → 유형 → 꿀팁 → 풀이 → 완료 플로우
const LevelSelect = lazy(() => import('./pages/learning/LevelSelect'));
const CategorySelect = lazy(() => import('./pages/learning/CategorySelect'));
const TypeList = lazy(() => import('./pages/learning/TypeList'));
const TypeTips = lazy(() => import('./pages/learning/TypeTips'));
const ProblemSolve = lazy(() => import('./pages/learning/ProblemSolve'));
const TypeComplete = lazy(() => import('./pages/learning/TypeComplete'));
const Test = lazy(() => import('./pages/Test'));
const League = lazy(() => import('./pages/League'));
const Community = lazy(() => import('./pages/Community'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Search = lazy(() => import('./pages/Search'));
const Notifications = lazy(() => import('./pages/Notifications'));
// 관리자 콘솔
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProblemReview = lazy(() => import('./pages/admin/AdminProblemReview'));

export default function App() {
  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/learning" element={<LevelSelect />} />
            <Route path="/learning/:level" element={<CategorySelect />} />
            <Route path="/learning/:level/:category" element={<TypeList />} />
            <Route path="/learning/:level/:category/:typeId" element={<TypeTips />} />
            <Route path="/learning/:level/:category/:typeId/solve" element={<ProblemSolve />} />
            <Route path="/learning/:level/:category/:typeId/complete" element={<TypeComplete />} />
            <Route path="/test" element={<Test />} />
            <Route path="/league" element={<League />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:id" element={<PostDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 관리자 전용 (탭바 없는 별도 레이아웃) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/review" element={<AdminProblemReview />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
