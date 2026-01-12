import { getDb } from './db.js';
import { get, set, del } from './cache.js';

const CACHE_KEY_ALLOWED_DOMAINS = 'allowed_domains';

/**
 * Middleware to check if the request origin/referer is in the allowed domains list
 * Returns true if domain is allowed or if no domains are configured (allow all)
 * Returns false if domain is not allowed
 */
export async function checkAllowedDomain(req) {
  try {
    // Try to get from cache first (allow stale cache)
    let allowedDomains = get(CACHE_KEY_ALLOWED_DOMAINS, true);
    
    if (!allowedDomains) {
      // Cache miss, fetch from database
      try {
        const sql = getDb();
        const result = await sql`
          SELECT domain FROM allowed_domains WHERE is_active = true
        `;
        
        allowedDomains = result;
        
        // Cache the result for 5 minutes
        set(CACHE_KEY_ALLOWED_DOMAINS, allowedDomains);
      } catch (dbError) {
        console.error('Database error fetching allowed domains:', dbError);
        
        // Try to use stale cache if available
        allowedDomains = get(CACHE_KEY_ALLOWED_DOMAINS, true);
        
        if (!allowedDomains) {
          // No cache available, fail open (allow all) for availability
          console.warn('No cached domains available, allowing access');
          return { allowed: true, reason: 'Database unavailable, no cache available - allowing access' };
        }
        
        console.log('Using stale cache for allowed domains');
      }
    }

    // If no domains are configured, allow all (backward compatibility)
    if (allowedDomains.length === 0) {
      return { allowed: true, reason: 'No domains configured' };
    }

    // Extract domain from request
    const origin = req.headers.origin || req.headers.referer || '';
    const host = req.headers.host || '';
    
    // Try to extract domain from origin or referer
    let requestDomain = '';
    if (origin) {
      try {
        const url = new URL(origin);
        requestDomain = url.hostname.toLowerCase();
      } catch (e) {
        // If origin is not a valid URL, try to extract domain from host header
        requestDomain = host.toLowerCase();
      }
    } else {
      requestDomain = host.toLowerCase();
    }

    // Remove port if present
    requestDomain = requestDomain.split(':')[0];

    // Check if request domain matches any allowed domain
    const domainList = allowedDomains.map(d => d.domain.toLowerCase());
    
    // Check exact match
    if (domainList.includes(requestDomain)) {
      return { allowed: true, reason: 'Domain matched' };
    }

    // Check subdomain matches (e.g., www.example.com matches example.com)
    for (const allowedDomain of domainList) {
      if (requestDomain === allowedDomain || requestDomain.endsWith('.' + allowedDomain)) {
        return { allowed: true, reason: 'Subdomain matched' };
      }
    }

    // Domain not allowed
    return { 
      allowed: false, 
      reason: `Domain ${requestDomain} is not in the allowed domains list`,
      allowedDomains: domainList
    };
  } catch (error) {
    console.error('Domain check error:', error);
    // On error, allow access (fail open for availability)
    return { allowed: true, reason: 'Error checking domain, allowing access' };
  }
}

/**
 * Invalidate the allowed domains cache
 * Call this when domains are created, updated, or deleted
 */
export function invalidateAllowedDomainsCache() {
  del(CACHE_KEY_ALLOWED_DOMAINS);
}

/**
 * Middleware function to use with Express/Vercel handlers
 */
export async function domainCheckMiddleware(req, res, next) {
  const checkResult = await checkAllowedDomain(req);
  
  if (!checkResult.allowed) {
    return res.status(403).json({
      error: 'Access denied',
      message: checkResult.reason
    });
  }
  
  if (next) {
    next();
  }
}
