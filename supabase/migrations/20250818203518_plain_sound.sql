/*
# Create reports table for cybercrime reporting

1. New Tables
  - `reports`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references users.id)
    - `category` (text, required)
    - `title` (text, required)
    - `description` (text, required)
    - `location` (text)
    - `incident_date` (date)
    - `file_url` (text, for uploaded evidence)
    - `reference_id` (text, unique identifier for users)
    - `status` (text, default 'pending')
    - `created_at` (timestamp)

2. Security
  - Enable RLS on `reports` table
  - Add policies for reading public data and managing own reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('fraud', 'phishing', 'harassment', 'deepfake')),
  title text NOT NULL,
  description text NOT NULL,
  location text,
  incident_date date,
  file_url text,
  reference_id text UNIQUE NOT NULL DEFAULT 'CR-' || upper(substr(md5(random()::text), 1, 8)),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports"
  ON reports
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own reports"
  ON reports
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS reports_category_idx ON reports(category);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reference_id_idx ON reports(reference_id);