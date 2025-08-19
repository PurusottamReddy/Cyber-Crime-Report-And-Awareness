-- Add status column to reports table if it doesn't exist
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Under Review';

-- Add status column to articles table if it doesn't exist
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';

-- Add views column to articles table if it doesn't exist
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Update RLS policies for reports table
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete own reports" ON reports
    FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for articles table
DROP POLICY IF EXISTS "Users can view own articles" ON articles;
DROP POLICY IF EXISTS "Users can update own articles" ON articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON articles;

-- Users can view their own articles
CREATE POLICY "Users can view own articles" ON articles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own articles
CREATE POLICY "Users can update own articles" ON articles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own articles
CREATE POLICY "Users can delete own articles" ON articles
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
