import { router } from './trpc';
import { authRouter } from './routers/auth';
import { discoveryRouter } from './routers/discovery';
import { chatRouter } from './routers/chat';
import { profileRouter } from './routers/profile';

export const appRouter = router({
  auth: authRouter,
  discovery: discoveryRouter,
  chat: chatRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
