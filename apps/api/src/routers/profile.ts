import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const profileRouter = router({
  getMe: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await ctx.models.Profile.findOne({ userId: ctx.userId });
      return profile;
    }),
    
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      age: z.number().optional(),
      bio: z.string().optional(),
      imageUrl: z.string().optional(),
      interests: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      
      const profile = await ctx.models.Profile.findOneAndUpdate(
        { userId },
        { $set: input },
        { upsert: true, new: true }
      );

      return profile;
    }),
});
