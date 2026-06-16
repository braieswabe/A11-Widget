-- Widget Monitoring, Support, and Translation Cache

CREATE TABLE IF NOT EXISTS widget_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_url TEXT,
  widget_version TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stale', 'down')),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(site_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_widget_installations_site ON widget_installations(site_id);
CREATE INDEX IF NOT EXISTS idx_widget_installations_domain ON widget_installations(domain);
CREATE INDEX IF NOT EXISTS idx_widget_installations_last_seen ON widget_installations(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_widget_installations_status ON widget_installations(status);

CREATE TABLE IF NOT EXISTS widget_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  domain TEXT,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  source TEXT NOT NULL DEFAULT 'widget',
  message TEXT NOT NULL,
  stack_summary TEXT,
  url TEXT,
  widget_version TEXT,
  browser JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_widget_errors_site_created ON widget_errors(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_widget_errors_severity ON widget_errors(severity);
CREATE INDEX IF NOT EXISTS idx_widget_errors_resolved ON widget_errors(is_resolved);

CREATE TABLE IF NOT EXISTS support_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  domain TEXT,
  url TEXT,
  issue_type TEXT NOT NULL DEFAULT 'bug',
  message TEXT NOT NULL,
  contact_email TEXT,
  widget_version TEXT,
  browser JSONB DEFAULT '{}'::jsonb,
  recent_errors JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_cases_site_created ON support_cases(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_cases_status ON support_cases(status);
CREATE INDEX IF NOT EXISTS idx_support_cases_assigned ON support_cases(assigned_to);

CREATE TABLE IF NOT EXISTS translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_hash TEXT NOT NULL,
  source_lang TEXT NOT NULL DEFAULT 'en',
  target_lang TEXT NOT NULL,
  provider TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_hash, source_lang, target_lang, provider)
);

CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup ON translation_cache(source_hash, source_lang, target_lang, provider);

DROP TRIGGER IF EXISTS update_support_cases_updated_at ON support_cases;
CREATE TRIGGER update_support_cases_updated_at BEFORE UPDATE ON support_cases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_cache_updated_at ON translation_cache;
CREATE TRIGGER update_translation_cache_updated_at BEFORE UPDATE ON translation_cache
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
