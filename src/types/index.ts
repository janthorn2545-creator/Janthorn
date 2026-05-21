export type UserRole = 'admin' | 'employee'
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  full_name: string
  department?: string
  position?: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  pass_score: number
  is_published: boolean
  requires_approval: boolean
  created_by?: string
  created_at: string
  updated_at: string
  // computed
  lesson_count?: number
  enrolled_count?: number
  avg_score?: number
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description?: string
  youtube_id?: string
  video_url?: string
  duration_sec: number
  order_index: number
  created_at: string
}

export interface Quiz {
  id: string
  course_id: string
  question: string
  options: string[]
  correct_index: number
  explanation?: string
  order_index: number
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: EnrollmentStatus
  approved_by?: string
  approved_at?: string
  rejection_note?: string
  enrolled_at: string
  // joins
  user?: User
  course?: Course
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  watch_seconds: number
  completed: boolean
  completed_at?: string
  updated_at: string
}

export interface QuizResult {
  id: string
  user_id: string
  course_id: string
  score: number
  total: number
  passed: boolean
  answers?: number[]
  taken_at: string
  // joins
  course?: Course
  user?: User
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  cert_code: string
  issued_at: string
  pdf_url?: string
  // joins
  course?: Course
  user?: User
}

export interface CourseWithProgress extends Course {
  enrollment?: Enrollment
  progress_percent: number
  best_score?: number
  certificate?: Certificate
}

export interface DashboardStats {
  total_users: number
  total_courses: number
  avg_pass_rate: number
  pending_approvals: number
  recent_activities: ActivityItem[]
}

export interface ActivityItem {
  id: string
  user_name: string
  action: string
  course_name?: string
  time: string
  type: 'pass' | 'fail' | 'enroll' | 'cert' | 'request'
}
