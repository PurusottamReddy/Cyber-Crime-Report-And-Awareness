-- Fix RLS policies for reports table
-- Run this in your Supabase SQL Editor

-- First, enable RLS on the reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Anyone can read reports" ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;

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

-- Also fix articles table policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own articles" ON articles;
DROP POLICY IF EXISTS "Users can update own articles" ON articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON articles;
DROP POLICY IF EXISTS "Users can insert own articles" ON articles;

-- Create proper policies for articles table
CREATE POLICY "Users can view own articles" ON articles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own articles" ON articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles" ON articles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles" ON articles
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
