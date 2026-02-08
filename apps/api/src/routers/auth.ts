import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
      
      const existingUser = await ctx.models.User.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already exists',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      const newUser = await ctx.models.User.create({
        email,
        passwordHash,
      });

      // Create an empty profile for the new user
      await ctx.models.Profile.create({
        userId: newUser._id,
        name: email.split('@')[0],
        age: 18,
      });

      return { success: true, userId: newUser._id.toString() };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      
      const user = await ctx.models.User.findOne({ email });
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

      const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '24h' });

      return { token, user: { id: user._id.toString(), email: user.email } };
    }),
});
