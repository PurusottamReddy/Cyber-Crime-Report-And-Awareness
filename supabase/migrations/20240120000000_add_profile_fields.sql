-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Update RLS policies to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON users;

CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);
