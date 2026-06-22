-- MY PLAN 데이터베이스 설정
-- Supabase 대시보드 → SQL Editor에서 실행하세요

-- 1. 일정 테이블
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  end_date TEXT,
  start_time TEXT,
  end_time TEXT,
  memo TEXT,
  color TEXT DEFAULT 'blue',
  repeat TEXT DEFAULT 'none',
  repeat_until TEXT,
  display_in TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 습관 테이블
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 습관 체크 테이블
CREATE TABLE IF NOT EXISTS habit_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  UNIQUE(habit_id, date)
);

-- 4. 할일 테이블
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 설정 테이블
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Row Level Security (내 데이터만 보이도록)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 7. 정책: 본인 데이터만 접근 가능
CREATE POLICY "own_events" ON events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_habit_checks" ON habit_checks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_todos" ON todos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
