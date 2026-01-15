-- Telemetry Enhancements Migration
-- Extends telemetry to support new event types

-- Note: The telemetry_events table already supports JSONB event_data,
-- so we don't need schema changes. This migration documents the new event types.

-- New event types supported:
-- - preset_applied: When a user applies a preset
--   event_data: { presetId, presetName, settings }
-- - feature_toggled: When a user toggles an individual feature
--   event_data: { feature, enabled, previousValue }
-- - recommendation_accepted: When a user accepts a smart recommendation
--   event_data: { recommendation, preset }
-- - compliance_panel_opened: When user opens compliance information
--   event_data: {}

-- Index for preset usage analytics
CREATE INDEX IF NOT EXISTS idx_telemetry_preset ON telemetry_events(
  (event_data->>'presetId')
) WHERE event_type = 'preset_applied';

-- Index for feature usage analytics
CREATE INDEX IF NOT EXISTS idx_telemetry_feature ON telemetry_events(
  (event_data->>'feature')
) WHERE event_type = 'feature_toggled';
