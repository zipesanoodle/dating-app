import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { profiles, swipes, matches } from '../db/schema';
import { eq, and, notInArray } from 'drizzle-orm';

export const discoveryRouter = router({
  getDiscovery: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.userId;

      // Find users that this user hasn't swiped on yet
      const userSwipes = await ctx.db.select({ toUserId: swipes.toUserId })
        .from(swipes)
        .where(eq(swipes.fromUserId, userId));
      
      const swipedUserIds = userSwipes.map(s => s.toUserId);
      swipedUserIds.push(userId);

      // Fetch profiles of users not in swipedUserIds
      const potentialMatches = await ctx.db.select()
        .from(profiles)
        .where(notInArray(profiles.userId, swipedUserIds))
        .limit(20);

      return potentialMatches.map(p => ({
        ...p,
        interests: p.interests ? JSON.parse(p.interests) : [],
      }));
    }),

  swipe: protectedProcedure
    .input(z.object({
      toUserId: z.number(),
      direction: z.enum(['left', 'right']),
    }))
    .mutation(async ({ input, ctx }) => {
      const fromUserId = ctx.userId;
      const { toUserId, direction } = input;

      // Save the swipe
      await ctx.db.insert(swipes).values({
        fromUserId,
        toUserId,
        direction,
      }).onConflictDoUpdate({
        target: [swipes.fromUserId, swipes.toUserId],
        set: { direction, createdAt: new Date().toISOString() }
      });

      let isMatch = false;
      if (direction === 'right') {
        const otherSwipe = await ctx.db.select()
          .from(swipes)
          .where(and(
            eq(swipes.fromUserId, toUserId),
            eq(swipes.toUserId, fromUserId),
            eq(swipes.direction, 'right')
          ))
          .get();

        if (otherSwipe) {
          isMatch = true;
          await ctx.db.insert(matches).values({
            user1Id: Math.min(fromUserId, toUserId),
            user2Id: Math.max(fromUserId, toUserId),
          }).onConflictDoNothing();
        }
      }

      return { success: true, isMatch };
    }),

  getMe: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await ctx.db.select().from(profiles).where(eq(profiles.userId, ctx.userId)).get();
      if (!profile) return null;
      return {
        ...profile,
        interests: profile.interests ? JSON.parse(profile.interests) : [],
      };
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
      const { interests, ...rest } = input;

      const existingProfile = await ctx.db.select().from(profiles).where(eq(profiles.userId, userId)).get();

      const updateData: any = { ...rest };
      if (interests) {
        updateData.interests = JSON.stringify(interests);
      }

      if (existingProfile) {
        await ctx.db.update(profiles)
          .set(updateData)
          .where(eq(profiles.userId, userId));
      } else {
        await ctx.db.insert(profiles).values({
          userId,
          ...updateData,
        });
      }

      return { success: true };
    }),
});
