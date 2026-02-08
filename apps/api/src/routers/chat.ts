import { z } from 'zod';
import { protectedProcedure, router, ee } from '../trpc';
import { observable } from '@trpc/server/observable';

export const chatRouter = router({
  getMatches: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.userId;
      const matches = await ctx.models.Match.find({
        users: userId
      });

      const matchDetails = await Promise.all(matches.map(async (match) => {
        const otherUserId = match.users.find((id: any) => id.toString() !== userId);
        const otherProfile = await ctx.models.Profile.findOne({ userId: otherUserId });
        const lastMessage = await ctx.models.Message.findOne({ matchId: match._id })
          .sort({ createdAt: -1 });

        return {
          id: match._id,
          otherUser: otherProfile,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : null
        };
      }));

      return matchDetails;
    }),

  getMessages: protectedProcedure
    .input(z.object({
      matchId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const messages = await ctx.models.Message.find({
        matchId: input.matchId
      }).sort({ createdAt: 1 });

      return messages;
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { matchId, content } = input;
      const senderId = ctx.userId;

      const message = await ctx.models.Message.create({
        matchId,
        senderId,
        content,
        createdAt: new Date()
      });

      ee.emit('newMessage', message);

      return message;
    }),

  onMessage: protectedProcedure
    .input(z.object({
      matchId: z.string(),
    }))
    .subscription(({ input }) => {
      return observable((emit) => {
        const onMessage = (message: any) => {
          if (message.matchId.toString() === input.matchId) {
            emit.next(message);
          }
        };

        ee.on('newMessage', onMessage);

        return () => {
          ee.off('newMessage', onMessage);
        };
      });
    }),

  onNewMessageGlobal: protectedProcedure
    .subscription(({ ctx }) => {
      return observable((emit) => {
        const onMessage = async (message: any) => {
          // Check if this message belongs to a match the user is part of
          const match = await ctx.models.Match.findOne({
            _id: message.matchId,
            users: ctx.userId
          });

          if (match && message.senderId.toString() !== ctx.userId) {
            emit.next(message);
          }
        };

        ee.on('newMessage', onMessage);

        return () => {
          ee.off('newMessage', onMessage);
        };
      });
    }),
});
