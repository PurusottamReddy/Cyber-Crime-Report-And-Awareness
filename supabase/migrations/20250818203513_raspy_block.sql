/*
# Create users table and authentication setup

1. New Tables
  - `users`
    - `id` (uuid, primary key, references auth.users)
    - `email` (text)
    - `name` (text)
    - `is_anonymous` (boolean, default false)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on `users` table
  - Add policy for authenticated users to read/update their own data
  - Add policy for anonymous users to insert records
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user data"
  ON users
  FOR INSERT
  WITH CHECK (true);