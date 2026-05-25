export interface User {
  id: string;
  email: string;
  username: string;
  created_at?: string;
}

export interface UserProfile {
  user_id: string;
  level: number;
  total_points: number;
  current_streak: number;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content?: string | null;
  order_index: number;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  level: number;
  category?: string | null;
  thumbnail_url?: string | null;
  lessons?: Lesson[];
  created_at?: string;
}

export interface Problem {
  id: string;
  category: string;
  level: number;
  type: string;
  question: string;
  options?: string[] | null;
  correct_answer?: string;
  explanation?: string | null;
  points: number;
  // 학습 구조 개편: 유형 연결 + 보강 콘텐츠
  type_id?: string | null;
  hint?: string | null;
  detailed_explanation?: string | null;
  wrong_answer_analysis?: string[] | null; // options 순서에 대응하는 오답 분석
  learning_point?: string | null;
  review_tip?: string | null;
  // 검토/생성 메타 (시스템 1·3·4)
  status?: 'pending' | 'approved' | 'rejected' | string;
  created_by?: 'ai' | 'admin' | string;
  grammar_tags?: string[] | null;
  vocabulary_tags?: string[] | null;
  difficulty_predicted?: number | null;
}

export interface Vocabulary {
  id: string;
  word: string;
  level: number;
  pos?: string | null;
  theme?: string | null;
  meaning: string;
  example?: string | null;
  pronunciation?: string | null;
  frequency?: number | null;
  hanja?: string | null;
}

export type TopikLevel = 'topik1' | 'topik2_mid' | 'topik2_high';

export interface ProblemType {
  id: string;
  level: TopikLevel | string;
  category: string;
  type_number: number;
  type_name: string;
  description?: string | null;
  question_numbers?: string | null;
  tips: string[];
  warnings: string[];
  real_review?: string | null;
  difficulty: number;
  avg_accuracy?: number | null;
  created_at?: string;
}

export interface SubmissionResult {
  is_correct: boolean;
  score: number;
  correct_answer: string;
  explanation: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  author?: { id: string; username: string } | null;
  like_count?: number;
  comment_count?: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author?: { id: string; username: string } | null;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string | null;
  lesson_id: string | null;
  status: string;
  progress_percent: number;
  completed_at?: string | null;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  period: string;
  user?: { id: string; username: string } | null;
}

export interface CategoryStat {
  category: string;
  total: number;
  correct: number;
}

export interface UserStatistics {
  user: User;
  profile: UserProfile | null;
  statistics: {
    total_submissions: number;
    correct_count: number;
    accuracy: number;
    total_score: number;
    active_days?: number;
    by_category?: CategoryStat[];
  };
}

export interface SearchResults {
  courses: Course[];
  problems: Problem[];
  posts: Post[];
}

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'friend_request';
  target_type: string | null;
  target_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  actor?: { id: string; username: string } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
