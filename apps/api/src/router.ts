import { router } from './trpc';
import { authRouter } from './routers/auth';
import { discoveryRouter } from './routers/discovery';

export const appRouter = router({
  auth: authRouter,
  discovery: discoveryRouter,
});

export type AppRouter = typeof appRouter;
