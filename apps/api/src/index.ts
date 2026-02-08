import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { jwt } from 'hono/jwt';
import { cors } from 'hono/cors';
import { db } from './db';
import { users, profiles, swipes, matches } from './db/schema';
import { eq, and, notInArray, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const app = new Hono();
app.use('/*', cors());
const JWT_SECRET = 'heartsync-secret-change-me';

// Auth middleware for protected routes
const authMiddleware = jwt({
  secret: JWT_SECRET,
});

app.get('/', (c) => c.text('HeartSync API v1 Ready!'));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Auth Endpoints ---

app.post('/auth/register', async (c) => {
  const { email, password } = await c.req.json();
  
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    return c.json({ error: 'User already exists' }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
  }).returning();

  // Create an empty profile for the new user
  await db.insert(profiles).values({
    userId: newUser.id,
    name: email.split('@')[0], // Default name
    age: 18, // Default age
  });

  return c.json({ success: true, userId: newUser.id });
});

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  
  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Generate JWT
  const payload = {
    userId: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };
  
  // Hono's jwt middleware expects sign from hono/jwt
  const { sign } = await import('hono/jwt');
  const token = await sign(payload, JWT_SECRET);

  return c.json({ token, user: { id: user.id, email: user.email } });
});

// --- Profile Endpoints ---

app.get('/profile/me', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.userId;

  const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).get();
  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json(profile);
});

app.post('/profile', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.userId;
  const body = await c.req.json();

  const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, userId)).get();

  if (existingProfile) {
    await db.update(profiles)
      .set({
        name: body.name,
        age: body.age,
        bio: body.bio,
        imageUrl: body.imageUrl,
        interests: body.interests ? JSON.stringify(body.interests) : null,
      })
      .where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({
      userId,
      name: body.name,
      age: body.age,
      bio: body.bio,
      imageUrl: body.imageUrl,
      interests: body.interests ? JSON.stringify(body.interests) : null,
    });
  }

  return c.json({ success: true });
});

// --- Discovery & Swiping ---

app.get('/discovery', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.userId;

  // Find users that this user hasn't swiped on yet
  const userSwipes = await db.select({ toUserId: swipes.toUserId })
    .from(swipes)
    .where(eq(swipes.fromUserId, userId));
  
  const swipedUserIds = userSwipes.map(s => s.toUserId);
  swipedUserIds.push(userId); // Don't discover yourself

  // Fetch profiles of users not in swipedUserIds
  const potentialMatches = await db.select()
    .from(profiles)
    .where(notInArray(profiles.userId, swipedUserIds))
    .limit(20);

  // Parse interests if they are stored as JSON strings
  const formattedProfiles = potentialMatches.map(p => ({
    ...p,
    interests: p.interests ? JSON.parse(p.interests) : [],
  }));

  return c.json(formattedProfiles);
});

app.post('/swipe', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload');
  const fromUserId = payload.userId;
  const { toUserId, direction } = await c.req.json();

  if (!toUserId || !direction) {
    return c.json({ error: 'toUserId and direction are required' }, 400);
  }

  // Save the swipe
  await db.insert(swipes).values({
    fromUserId,
    toUserId,
    direction,
  }).onConflictDoUpdate({
    target: [swipes.fromUserId, swipes.toUserId],
    set: { direction, createdAt: new Date().toISOString() }
  });

  let isMatch = false;
  if (direction === 'right') {
    // Check if the other user has already swiped right on this user
    const otherSwipe = await db.select()
      .from(swipes)
      .where(and(
        eq(swipes.fromUserId, toUserId),
        eq(swipes.toUserId, fromUserId),
        eq(swipes.direction, 'right')
      ))
      .get();

    if (otherSwipe) {
      isMatch = true;
      // Record the match
      await db.insert(matches).values({
        user1Id: Math.min(fromUserId, toUserId),
        user2Id: Math.max(fromUserId, toUserId),
      }).onConflictDoNothing();
    }
  }

  return c.json({ success: true, isMatch });
});

const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
