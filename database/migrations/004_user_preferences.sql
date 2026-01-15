-- User Preferences Migration
-- Allows syncing accessibility preferences with authenticated users

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  site_id TEXT NOT NULL,
  preferences JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, site_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_site ON user_preferences(user_id, site_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_site ON user_preferences(site_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated ON user_preferences(updated_at);

-- Update trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
