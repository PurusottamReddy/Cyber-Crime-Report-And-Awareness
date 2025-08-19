/*
# Reset articles feature (drop old blogs and create new articles table)

1) Drop legacy blogs table (if exists)
2) Create articles table with ownership
3) Add RLS policies (public read for published, owners manage own)
4) Trigger to maintain updated_at
*/

-- 1) Drop old table
DROP TABLE IF EXISTS public.blogs CASCADE;

-- 2) New articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies
-- Anyone can read published articles
CREATE POLICY IF NOT EXISTS "Anyone can read published articles"
  ON public.articles FOR SELECT TO authenticated, anon
  USING (published = true);

-- Owners can read their own (including drafts)
CREATE POLICY IF NOT EXISTS "Users can read own articles"
  ON public.articles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Owners can insert their own
CREATE POLICY IF NOT EXISTS "Users can insert own articles"
  ON public.articles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Owners can update their own
CREATE POLICY IF NOT EXISTS "Users can update own articles"
  ON public.articles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Owners can delete their own
CREATE POLICY IF NOT EXISTS "Users can delete own articles"
  ON public.articles FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Index for listing
CREATE INDEX IF NOT EXISTS articles_published_created_idx
  ON public.articles (published, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_articles_updated_at ON public.articles;
CREATE TRIGGER trg_update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_articles_updated_at();

-- Ensure PostgREST reloads
NOTIFY pgrst, 'reload schema';


