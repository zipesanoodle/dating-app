import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { users, profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { TRPCError } from '@trpc/server';

const JWT_SECRET = 'heartsync-secret-change-me';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      
      const existingUser = await ctx.db.select().from(users).where(eq(users.email, email)).get();
      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already exists',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      const [newUser] = await ctx.db.insert(users).values({
        email,
        passwordHash,
      }).returning();

      // Create an empty profile for the new user
      await ctx.db.insert(profiles).values({
        userId: newUser.id,
        name: email.split('@')[0],
        age: 18,
      });

      return { success: true, userId: newUser.id };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      
      const user = await ctx.db.select().from(users).where(eq(users.email, email)).get();
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const payload = {
        userId: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      };
      
      const token = await sign(payload, JWT_SECRET);

      return { token, user: { id: user.id, email: user.email } };
    }),
});
