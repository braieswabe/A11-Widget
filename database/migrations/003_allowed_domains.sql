-- Migration 003: Allowed Domains
-- Adds domain whitelist functionality for controlling website access

-- Allowed domains table
CREATE TABLE IF NOT EXISTS allowed_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_allowed_domains_domain ON allowed_domains(domain);
CREATE INDEX IF NOT EXISTS idx_allowed_domains_is_active ON allowed_domains(is_active);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_allowed_domains_updated_at ON allowed_domains;
CREATE TRIGGER update_allowed_domains_updated_at BEFORE UPDATE ON allowed_domains
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
