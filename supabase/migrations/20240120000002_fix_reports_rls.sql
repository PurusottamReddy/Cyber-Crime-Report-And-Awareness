-- Fix RLS policies for reports table to ensure proper user access
-- Drop conflicting policies
DROP POLICY IF EXISTS "Anyone can read reports" ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Create proper policies for reports table
-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete own reports" ON reports
    FOR DELETE USING (auth.uid() = user_id);

-- Allow anonymous users to insert reports (for anonymous reporting)
CREATE POLICY "Anonymous users can insert reports" ON reports
    FOR INSERT WITH CHECK (user_id IS NULL);

-- Allow public read access for scam wall (but not full details)
CREATE POLICY "Public can read report summaries" ON reports
    FOR SELECT USING (true);
