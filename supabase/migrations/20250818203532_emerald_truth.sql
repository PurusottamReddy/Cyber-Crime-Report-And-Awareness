/*
# Create fraud_lookups table for storing reported entities

1. New Tables
  - `fraud_lookups`
    - `id` (uuid, primary key)
    - `report_id` (uuid, references reports.id)
    - `entity_type` (text, email/phone/website)
    - `entity_value` (text, the actual value)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on `fraud_lookups` table
  - Add policies for reading and inserting lookup data
*/

CREATE TABLE IF NOT EXISTS fraud_lookups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('email', 'phone', 'website')),
  entity_value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fraud_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read fraud lookups"
  ON fraud_lookups
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert fraud lookups"
  ON fraud_lookups
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create indexes for faster lookup queries
CREATE INDEX IF NOT EXISTS fraud_lookups_entity_value_idx ON fraud_lookups(entity_value);
CREATE INDEX IF NOT EXISTS fraud_lookups_entity_type_idx ON fraud_lookups(entity_type);
CREATE INDEX IF NOT EXISTS fraud_lookups_report_id_idx ON fraud_lookups(report_id);