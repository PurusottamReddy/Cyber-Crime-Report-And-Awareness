/* Add author column to articles */
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS author text;

-- Optional: backfill existing rows based on users table
UPDATE public.articles a
SET author = COALESCE(u.name, u.email)
FROM public.users u
WHERE a.author IS NULL AND a.user_id = u.id;

NOTIFY pgrst, 'reload schema';


