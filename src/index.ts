import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { v4 as uuidv4 } from 'uuid';

type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
  SECRET_KEY: string;
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API version endpoint
app.get('/api/v1/status', (c) => {
  return c.json({
    version: '0.1.0',
    system: 'AIMS - Aggregator Intelligence & Monitoring System',
    deployment: 'Cloudflare Workers',
  });
});

// Root API endpoint
app.get('/api', (c) => {
  return c.json({
    message: 'AIMS API - Welcome',
    endpoints: {
      health: '/health',
      status: '/api/v1/status',
      docs: '/api/docs',
    },
  });
});

// Example: Analytics endpoint (replace with your actual analytics)
app.get('/api/v1/analytics', async (c) => {
  try {
    const cached = await c.env.CACHE.get('analytics');
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    const data = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      active_sessions: 42,
      total_events: 1024,
    };

    await c.env.CACHE.put('analytics', JSON.stringify(data), { expirationTtl: 300 });
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Proxy or mirror endpoints from the original API
// This can connect to your PostgreSQL backend if needed
app.all('/api/v1/*', async (c) => {
  // If you want to proxy to an external backend:
  // const url = `${c.env.DATABASE_URL}${c.req.path}`;
  // const response = await fetch(url, { method: c.req.method });
  // return response;

  // For now, return a placeholder
  return c.json({
    message: 'API endpoint handler',
    path: c.req.path,
    method: c.req.method,
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
  }, 500);
});

export default app;
