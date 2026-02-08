import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from './router';
import { createContext } from './trpc';

const app = new Hono();
app.use('/*', cors());

app.get('/', (c) => c.text('HeartSync API v1 Ready!'));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// tRPC handler
app.all('/trpc/*', async (c) => {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext(opts),
  });
});

const port = 3001;
const server = serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on http://localhost:${port}`);

// WebSocket support
const wss = new WebSocketServer({ server: server as any });
applyWSSHandler({
  wss,
  router: appRouter,
  createContext: (opts) => createContext(opts as any),
});

wss.on('connection', (socket) => {
  console.log(`+ Connection (${wss.clients.size})`);
  socket.once('close', () => {
    console.log(`- Connection (${wss.clients.size})`);
  });
});
