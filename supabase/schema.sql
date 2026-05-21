-- ============================================================
-- TrainHub Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  department  TEXT,
  position    TEXT,
  role        user_role NOT NULL DEFAULT 'employee',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  thumbnail_url   TEXT,
  pass_score      INTEGER NOT NULL DEFAULT 70,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID REFERENCES public.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (Video lessons per course)
CREATE TABLE public.lessons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id     UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  youtube_id    TEXT,
  video_url     TEXT,
  duration_sec  INTEGER DEFAULT 0,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes
CREATE TABLE public.quizzes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id     UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation   TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE public.enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status          enrollment_status NOT NULL DEFAULT 'pending',
  approved_by     UUID REFERENCES public.users(id),
  approved_at     TIMESTAMPTZ,
  rejection_note  TEXT,
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Lesson Progress
CREATE TABLE public.lesson_progress (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  watch_seconds INTEGER DEFAULT 0,
  completed     BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Quiz Results
CREATE TABLE public.quiz_results (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL,
  total       INTEGER NOT NULL,
  passed      BOOLEAN NOT NULL,
  answers     JSONB,
  taken_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates
CREATE TABLE public.certificates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  cert_code   TEXT NOT NULL UNIQUE DEFAULT 'CERT-' || upper(substring(md5(random()::text), 1, 8)),
  issued_at   TIMESTAMPTZ DEFAULT NOW(),
  pdf_url     TEXT,
  UNIQUE(user_id, course_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- USERS ----
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT USING (get_my_role() = 'admin');
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE USING (get_my_role() = 'admin');

-- ---- COURSES ----
CREATE POLICY "Everyone can view published courses"
  ON public.courses FOR SELECT USING (is_published = true OR get_my_role() = 'admin');
CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL USING (get_my_role() = 'admin');

-- ---- LESSONS ----
CREATE POLICY "Enrolled users can view lessons"
  ON public.lessons FOR SELECT USING (
    get_my_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id = lessons.course_id
        AND e.status = 'approved'
    )
  );
CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL USING (get_my_role() = 'admin');

-- ---- QUIZZES ----
CREATE POLICY "Enrolled users can view quizzes"
  ON public.quizzes FOR SELECT USING (
    get_my_role() = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id = quizzes.course_id
        AND e.status = 'approved'
    )
  );
CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL USING (get_my_role() = 'admin');

-- ---- ENROLLMENTS ----
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT USING (user_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "Users can request enrollment"
  ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage enrollments"
  ON public.enrollments FOR ALL USING (get_my_role() = 'admin');

-- ---- LESSON PROGRESS ----
CREATE POLICY "Users can view own progress"
  ON public.lesson_progress FOR SELECT USING (user_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "Users can update own progress"
  ON public.lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can upsert own progress"
  ON public.lesson_progress FOR UPDATE USING (user_id = auth.uid());

-- ---- QUIZ RESULTS ----
CREATE POLICY "Users can view own results"
  ON public.quiz_results FOR SELECT USING (user_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "Users can insert own results"
  ON public.quiz_results FOR INSERT WITH CHECK (user_id = auth.uid());

-- ---- CERTIFICATES ----
CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT USING (user_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "System can insert certificates"
  ON public.certificates FOR INSERT WITH CHECK (get_my_role() = 'admin');

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-enroll in non-restricted courses
CREATE OR REPLACE FUNCTION public.auto_enroll_public_courses()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.enrollments (user_id, course_id, status)
  SELECT NEW.id, c.id, 'approved'
  FROM public.courses c
  WHERE c.requires_approval = false AND c.is_published = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_enroll
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_public_courses();

-- ============================================================
-- SEED DATA (optional - remove in production)
-- ============================================================

-- Insert a sample admin (replace with real email after signup)
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@yourcompany.com';
