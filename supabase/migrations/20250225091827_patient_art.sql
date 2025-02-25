/*
  # Create traffic updates table

  1. New Tables
    - `traffic_updates`
      - `id` (uuid, primary key)
      - `message` (text, original message)
      - `timestamp` (timestamptz, when the update was created)
      - `cities` (text[], list of affected cities)
      - `traffic_status` (jsonb, traffic conditions between cities)
      - `checkpoint_status` (jsonb, status of checkpoints)
      - `incidents` (text[], list of reported incidents)

  2. Security
    - Enable RLS on `traffic_updates` table
    - Add policy for authenticated users to read all traffic updates
    - Add policy for authenticated service role to insert/update traffic updates
*/

-- Create the traffic_updates table
CREATE TABLE IF NOT EXISTS traffic_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  cities text[],
  traffic_status jsonb,
  checkpoint_status jsonb,
  incidents text[]
);

-- Enable Row Level Security
ALTER TABLE traffic_updates ENABLE ROW LEVEL SECURITY;

-- Create policy for reading traffic updates (public access)
CREATE POLICY "Allow public read access"
  ON traffic_updates
  FOR SELECT
  TO public
  USING (true);

-- Create policy for inserting traffic updates (service role only)
CREATE POLICY "Allow service role to insert"
  ON traffic_updates
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy for updating traffic updates (service role only)
CREATE POLICY "Allow service role to update"
  ON traffic_updates
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS traffic_updates_timestamp_idx ON traffic_updates (timestamp DESC);
CREATE INDEX IF NOT EXISTS traffic_updates_cities_idx ON traffic_updates USING GIN (cities);