/*
# Create deepfakes table for specialized deepfake reporting

1. New Tables
  - `deepfakes`
    - `id` (uuid, primary key)
    - `report_id` (uuid, references reports.id)
    - `file_url` (text, required)
    - `file_name` (text)
    - `file_size` (bigint)
    - `file_type` (text)
    - `metadata` (jsonb, for storing file metadata)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on `deepfakes` table
  - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS deepfakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text,
  file_size bigint,
  file_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deepfakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read deepfake records"
  ON deepfakes
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert deepfake records"
  ON deepfakes
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS deepfakes_report_id_idx ON deepfakes(report_id);