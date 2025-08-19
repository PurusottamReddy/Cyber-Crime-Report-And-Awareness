/*
# Ownership and RLS fixes

1. Blogs ownership
 - Add user_id referencing users(id)
 - Tighten RLS so only owners can insert/update/delete and read own drafts

2. Reports delete policy
 - Allow only owners to delete their own reports
*/

-- 1) Blogs ownership
ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE SET NULL;

-- Drop overly-permissive policy if it exists
DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON blogs;

-- Allow anyone to read published blogs (kept)
-- (policy may already exist; keep as-is)

-- Allow authenticated users to read their own (draft or published) blogs
CREATE POLICY IF NOT EXISTS "Users can read own blogs"
  ON blogs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert: only if inserting as self
CREATE POLICY IF NOT EXISTS "Users can insert own blogs"
  ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update: only if owner
CREATE POLICY IF NOT EXISTS "Users can update own blogs"
  ON blogs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Delete: only if owner
CREATE POLICY IF NOT EXISTS "Users can delete own blogs"
  ON blogs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 2) Reports delete policy: only owner can delete
CREATE POLICY IF NOT EXISTS "Users can delete own reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


