import { getDb } from '../utils/db.js';
import { extractToken, verifyToken } from '../utils/auth.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { siteId, days = 30 } = req.query;

  if (!process.env.NEON_DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const sql = getDb();
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Build query with optional siteId filter
    let query = sql`
      SELECT 
        event_type,
        event_data,
        url,
        timestamp
      FROM telemetry_events
      WHERE timestamp >= ${daysAgo}
    `;

    if (siteId) {
      query = sql`
        SELECT 
          event_type,
          event_data,
          url,
          timestamp
        FROM telemetry_events
        WHERE timestamp >= ${daysAgo} AND site_id = ${siteId}
      `;
    }

    const events = await query;

    // Calculate statistics
    const stats = {
      totalEvents: events.length,
      widgetOpened: events.filter(e => e.event_type === 'widget_open').length,
      presetUsage: {},
      featureUsage: {},
      recommendationAcceptance: 0,
      compliancePanelOpened: 0,
      pagesWithMostUsage: {},
      dateRange: {
        start: daysAgo.toISOString(),
        end: new Date().toISOString()
      }
    };

    // Analyze preset usage
    events
      .filter(e => e.event_type === 'preset_applied' && e.event_data)
      .forEach(e => {
        const presetId = e.event_data.presetId || 'unknown';
        stats.presetUsage[presetId] = (stats.presetUsage[presetId] || 0) + 1;
      });

    // Analyze feature usage
    events
      .filter(e => e.event_type === 'feature_toggled' && e.event_data)
      .forEach(e => {
        const feature = e.event_data.feature || 'unknown';
        stats.featureUsage[feature] = (stats.featureUsage[feature] || 0) + 1;
      });

    // Count recommendation acceptance
    stats.recommendationAcceptance = events.filter(
      e => e.event_type === 'recommendation_accepted'
    ).length;

    // Count compliance panel opens
    stats.compliancePanelOpened = events.filter(
      e => e.event_type === 'compliance_panel_opened'
    ).length;

    // Analyze pages with most usage
    events
      .filter(e => e.url)
      .forEach(e => {
        const url = new URL(e.url).pathname;
        stats.pagesWithMostUsage[url] = (stats.pagesWithMostUsage[url] || 0) + 1;
      });

    // Calculate percentage of users using accessibility tools
    const uniqueUsers = new Set();
    events.forEach(e => {
      // Extract user identifier from event if available
      if (e.event_data && e.event_data.userId) {
        uniqueUsers.add(e.event_data.userId);
      }
    });

    // Sort pages by usage
    const sortedPages = Object.entries(stats.pagesWithMostUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));

    // Sort presets by usage
    const sortedPresets = Object.entries(stats.presetUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([presetId, count]) => ({ presetId, count }));

    // Sort features by usage
    const sortedFeatures = Object.entries(stats.featureUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([feature, count]) => ({ feature, count }));

    return res.status(200).json({
      success: true,
      stats: {
        ...stats,
        uniqueUsers: uniqueUsers.size,
        topPages: sortedPages,
        topPresets: sortedPresets,
        topFeatures: sortedFeatures
      }
    });
  } catch (error) {
    console.error('Accessibility stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
