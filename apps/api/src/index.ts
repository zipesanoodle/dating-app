import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/', (c) => c.text('HeartSync API v1 Ready!'));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Discovery API - Placeholder
app.get('/discovery', (c) => {
  return c.json([
    { id: 1, name: 'Alice', age: 25, bio: 'Love hiking and travel', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop' },
    { id: 2, name: 'Bob', age: 28, bio: 'Coffee enthusiast and coder', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop' },
  ]);
});

// Swiping API - Placeholder
app.post('/swipe', async (c) => {
  const { fromUserId, toUserId, direction } = await c.req.json();
  console.log(`User ${fromUserId} swiped ${direction} on User ${toUserId}`);
  
  // Logic to check for match would go here
  const isMatch = direction === 'right' && Math.random() > 0.5; // Random for now
  
  return c.json({ success: true, isMatch });
});

const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
