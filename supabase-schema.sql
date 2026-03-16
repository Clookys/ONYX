-- ============================================
-- ONYX RADAR — Schéma Supabase
-- Exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================

-- Dossiers de sources
CREATE TABLE folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#00f0ff',
  position INTEGER DEFAULT 0,
  expanded BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sources (RSS / Scrape)
CREATE TABLE sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT DEFAULT 'rss' CHECK (type IN ('rss', 'scrape')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'error', 'paused')),
  with_static BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Articles
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT,
  source_name TEXT,
  source_color TEXT,
  is_static BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  cluster_id TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Moteurs d'analyse
CREATE TABLE engines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '✦',
  color TEXT DEFAULT '#00f0ff',
  description TEXT,
  mode TEXT DEFAULT 'select',
  extract_raw BOOLEAN DEFAULT false,
  values JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  custom_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tags d'analyse sur les articles
CREATE TABLE article_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE NOT NULL,
  values TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, engine_id)
);

-- Notes personnelles
CREATE TABLE article_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alertes
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  condition TEXT DEFAULT 'any',
  engine_id UUID REFERENCES engines(id) ON DELETE SET NULL,
  engine_value TEXT,
  color TEXT DEFAULT '#ff003c',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  text TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- Chaque utilisateur ne voit que SES données
-- ============================================

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies: chaque user accède uniquement à ses propres données
CREATE POLICY "Users see own folders" ON folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own sources" ON sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own articles" ON articles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own engines" ON engines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own analyses" ON article_analyses FOR ALL USING (
  article_id IN (SELECT id FROM articles WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own notes" ON article_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Index pour la performance
-- ============================================
CREATE INDEX idx_sources_folder ON sources(folder_id);
CREATE INDEX idx_articles_source ON articles(source_id);
CREATE INDEX idx_articles_user ON articles(user_id);
CREATE INDEX idx_analyses_article ON article_analyses(article_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
