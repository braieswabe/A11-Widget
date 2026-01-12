import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Helper to convert Express req/res to Vercel format
function createVercelHandler(handler) {
  return async (req, res) => {
    // #region agent log
    const logData = {
      location: 'server.js:createVercelHandler',
      message: 'API request received',
      data: {
        method: req.method,
        path: req.path,
        url: req.url,
        hasBody: !!req.body
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    };
    console.log('[DEBUG]', JSON.stringify(logData));
    try {
      const fs = require('fs');
      const logPath = '/Users/braiebook/a11y_widget_v1/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify(logData) + '\n');
    } catch (e) {}
    // #endregion
    
    const vercelReq = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      connection: req.connection
    };

    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => {
        res.json(data);
        return vercelRes;
      },
      end: () => {
        res.end();
        return vercelRes;
      },
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      // #region agent log
      const errorLog = {
        location: 'server.js:createVercelHandler',
        message: 'API handler error',
        data: {
          error: error.message,
          stack: error.stack?.substring(0, 200),
          path: req.path
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A'
      };
      console.log('[DEBUG]', JSON.stringify(errorLog));
      try {
        const fs = require('fs');
        const logPath = '/Users/braiebook/a11y_widget_v1/.cursor/debug.log';
        fs.appendFileSync(logPath, JSON.stringify(errorLog) + '\n');
      } catch (e) {}
      // #endregion
      console.error('API handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

// Dynamically load API routes
async function loadApiRoutes() {
  const apiDir = join(__dirname, 'api');
  
  // Health check
  try {
    const healthHandler = (await import('./api/health.js')).default;
    app.get('/api/health', createVercelHandler(healthHandler));
    console.log('Loaded: /api/health');
  } catch (e) {
    console.error('Failed to load /api/health:', e.message);
  }

  // Telemetry
  try {
    const telemetryHandler = (await import('./api/telemetry.js')).default;
    app.post('/api/telemetry', createVercelHandler(telemetryHandler));
    console.log('Loaded: /api/telemetry');
  } catch (e) {
    console.error('Failed to load /api/telemetry:', e.message);
  }

  // Auth routes
  try {
    const loginHandler = (await import('./api/auth/login.js')).default;
    app.post('/api/auth/login', createVercelHandler(loginHandler));
    console.log('Loaded: /api/auth/login');
  } catch (e) {
    console.error('Failed to load /api/auth/login:', e.message);
  }

  try {
    const logoutHandler = (await import('./api/auth/logout.js')).default;
    app.post('/api/auth/logout', createVercelHandler(logoutHandler));
    console.log('Loaded: /api/auth/logout');
  } catch (e) {
    console.error('Failed to load /api/auth/logout:', e.message);
  }

  try {
    const refreshHandler = (await import('./api/auth/refresh.js')).default;
    app.post('/api/auth/refresh', createVercelHandler(refreshHandler));
    console.log('Loaded: /api/auth/refresh');
  } catch (e) {
    console.error('Failed to load /api/auth/refresh:', e.message);
  }

  try {
    const validateHandler = (await import('./api/auth/validate.js')).default;
    app.post('/api/auth/validate', createVercelHandler(validateHandler));
    console.log('Loaded: /api/auth/validate');
  } catch (e) {
    console.error('Failed to load /api/auth/validate:', e.message);
  }

  // Config route with dynamic parameter
  try {
    const configHandlerModule = await import('./api/config/[siteId].js');
    const configHandler = configHandlerModule.default;
    app.get('/api/config/:siteId', (req, res) => {
      // Convert Express params to query for Vercel handler
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: { siteId: req.params.siteId },
        body: req.body,
        connection: req.connection
      };
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
          return vercelRes;
        },
        end: () => {
          res.end();
          return vercelRes;
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
          return vercelRes;
        }
      };
      configHandler(vercelReq, vercelRes).catch((error) => {
        console.error('Config handler error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    });
    console.log('Loaded: /api/config/:siteId');
  } catch (e) {
    console.error('Failed to load /api/config/:siteId:', e.message);
  }

  // Admin routes
  try {
    const adminLoginHandler = (await import('./api/admin/login.js')).default;
    app.post('/api/admin/login', createVercelHandler(adminLoginHandler));
    console.log('Loaded: /api/admin/login');
  } catch (e) {
    console.error('Failed to load /api/admin/login:', e.message);
  }

  try {
    const adminClientsHandler = (await import('./api/admin/clients.js')).default;
    app.get('/api/admin/clients', createVercelHandler(adminClientsHandler));
    app.post('/api/admin/clients', createVercelHandler(adminClientsHandler));
    console.log('Loaded: /api/admin/clients');
  } catch (e) {
    console.error('Failed to load /api/admin/clients:', e.message);
  }

  // Admin client by ID routes - need to convert params to query
  try {
    const clientByIdHandler = (await import('./api/admin/clients/[id].js')).default;
    const createHandlerWithId = () => (req, res) => {
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: { ...req.query, id: req.params.id },
        body: req.body,
        connection: req.connection
      };
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
          return vercelRes;
        },
        end: () => {
          res.end();
          return vercelRes;
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
          return vercelRes;
        }
      };
      clientByIdHandler(vercelReq, vercelRes).catch((error) => {
        console.error('Client by ID handler error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    };
    app.get('/api/admin/clients/:id', createHandlerWithId());
    app.put('/api/admin/clients/:id', createHandlerWithId());
    app.delete('/api/admin/clients/:id', createHandlerWithId());
    console.log('Loaded: /api/admin/clients/:id');
  } catch (e) {
    console.error('Failed to load /api/admin/clients/:id:', e.message);
  }

  try {
    const regenerateKeyHandler = (await import('./api/admin/clients/[id]/regenerate-api-key.js')).default;
    app.post('/api/admin/clients/:id/regenerate-api-key', (req, res) => {
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: { ...req.query, id: req.params.id },
        body: req.body,
        connection: req.connection
      };
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
          return vercelRes;
        },
        end: () => {
          res.end();
          return vercelRes;
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
          return vercelRes;
        }
      };
      regenerateKeyHandler(vercelReq, vercelRes).catch((error) => {
        console.error('Regenerate key handler error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    });
    console.log('Loaded: /api/admin/clients/:id/regenerate-api-key');
  } catch (e) {
    console.error('Failed to load /api/admin/clients/:id/regenerate-api-key:', e.message);
  }

  // Admin domains routes
  try {
    const adminDomainsHandler = (await import('./api/admin/domains.js')).default;
    app.get('/api/admin/domains', createVercelHandler(adminDomainsHandler));
    app.post('/api/admin/domains', createVercelHandler(adminDomainsHandler));
    console.log('Loaded: /api/admin/domains');
  } catch (e) {
    console.error('Failed to load /api/admin/domains:', e.message);
  }

  // Admin domain by ID routes
  try {
    const domainByIdHandler = (await import('./api/admin/domains/[id].js')).default;
    const createDomainHandlerWithId = () => (req, res) => {
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: { ...req.query, id: req.params.id },
        body: req.body,
        connection: req.connection
      };
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
          return vercelRes;
        },
        end: () => {
          res.end();
          return vercelRes;
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
          return vercelRes;
        }
      };
      domainByIdHandler(vercelReq, vercelRes).catch((error) => {
        console.error('Domain by ID handler error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    };
    app.get('/api/admin/domains/:id', createDomainHandlerWithId());
    app.put('/api/admin/domains/:id', createDomainHandlerWithId());
    app.delete('/api/admin/domains/:id', createDomainHandlerWithId());
    console.log('Loaded: /api/admin/domains/:id');
  } catch (e) {
    console.error('Failed to load /api/admin/domains/:id:', e.message);
  }
}

// Serve static files from website/dist
const distPath = join(__dirname, 'website', 'dist');
const fs = require('fs');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Apply domain check middleware to website routes (not API routes or static assets)
  app.get('*', async (req, res, next) => {
    // Skip domain check for API routes, static assets, and widget files
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/assets/') || 
        req.path.startsWith('/a11y-widget') ||
        req.path.startsWith('/downloads/')) {
      return next();
    }
    
    // Apply domain check middleware
    try {
      const { domainCheckMiddleware } = await import('./api/utils/domainCheck.js');
      return domainCheckMiddleware(req, res, next);
    } catch (e) {
      // If domain check fails to load, allow access (fail open)
      console.warn('Domain check middleware not available:', e.message);
      return next();
    }
  });
  
  // Fallback to index.html for client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    const indexPath = join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Website not built. Please run: cd website && npm install && npm run build');
    }
  });
} else {
  console.warn(`Warning: ${distPath} does not exist. Static files will not be served.`);
  console.warn('Please run: cd website && npm install && npm run build');
  
  // Still handle API routes even if dist doesn't exist
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.status(503).send('Website not built. Please run: cd website && npm install && npm run build');
  });
}

// Load API routes and start server
loadApiRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API routes available at http://localhost:${PORT}/api/`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
