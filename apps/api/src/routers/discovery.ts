import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const discoveryRouter = router({
  getDiscovery: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.userId;

      // Find users that this user hasn't swiped on yet
      const userSwipes = await ctx.models.Swipe.find({ fromUserId: userId });
      const swipedUserIds = userSwipes.map(s => s.toUserId.toString());
      swipedUserIds.push(userId);

      // Fetch profiles of users not in swipedUserIds
      const potentialMatches = await ctx.models.Profile.find({
        userId: { $nin: swipedUserIds }
      }).limit(20);

      return potentialMatches;
    }),

  swipe: protectedProcedure
    .input(z.object({
      toUserId: z.string(),
      direction: z.enum(['left', 'right']),
    }))
    .mutation(async ({ input, ctx }) => {
      const fromUserId = ctx.userId;
      const { toUserId, direction } = input;

      // Save the swipe
      await ctx.models.Swipe.findOneAndUpdate(
        { fromUserId, toUserId },
        { direction, createdAt: new Date() },
        { upsert: true, new: true }
      );

      let isMatch = false;
      if (direction === 'right') {
        const otherSwipe = await ctx.models.Swipe.findOne({
          fromUserId: toUserId,
          toUserId: fromUserId,
          direction: 'right'
        });

        if (otherSwipe) {
          isMatch = true;
          // Create a match if it doesn't exist
          await ctx.models.Match.findOneAndUpdate(
            { users: { $all: [fromUserId, toUserId] } },
            { users: [fromUserId, toUserId], createdAt: new Date() },
            { upsert: true }
          );
        }
      }

      return { success: true, isMatch };
    }),
});
