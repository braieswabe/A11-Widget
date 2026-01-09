-- Initial migration for Accessibility Widget v1
-- This file contains the initial database schema

-- Telemetry events table
CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('widget_open', 'setting_change', 'reset', 'widget_close')),
  event_data JSONB,
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_site_time ON telemetry_events(site_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_time ON telemetry_events(event_type, timestamp);

-- Site configurations table
CREATE TABLE IF NOT EXISTS site_configs (
  site_id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_configs_updated ON site_configs(updated_at);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_configs_updated_at BEFORE UPDATE ON site_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

