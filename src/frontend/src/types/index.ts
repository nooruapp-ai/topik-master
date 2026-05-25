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

export interface UserStatistics {
  user: User;
  profile: UserProfile | null;
  statistics: {
    total_submissions: number;
    correct_count: number;
    accuracy: number;
    total_score: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
