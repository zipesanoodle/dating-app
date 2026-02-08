import { initTRPC, TRPCError } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { connectDB, User, Profile, Swipe, Match, Message } from './db';
import jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';

const JWT_SECRET = 'heartsync-secret-change-me';

export const ee = new EventEmitter();

export const createContext = async (opts: FetchCreateContextFnOptions | { req: Request }) => {
  await connectDB();
  const authHeader = opts.req.headers.get('Authorization');
  let userId: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = payload.userId;
    } catch (e) {
      // Invalid token
    }
  }

  return {
    models: { User, Profile, Swipe, Match, Message },
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
