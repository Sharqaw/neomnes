import { z } from "zod";
import { eq, and, desc, or } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const messageRouter = createRouter({
  send: authedQuery
    .input(
      z.object({
        recipientId: z.number(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [message] = await db
        .insert(schema.messages)
        .values({
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          content: input.content,
        })
        .$returningId();

      const existingConversation = await db.query.conversations.findFirst({
        where: or(
          and(
            eq(schema.conversations.participantA, ctx.user.id),
            eq(schema.conversations.participantB, input.recipientId)
          ),
          and(
            eq(schema.conversations.participantA, input.recipientId),
            eq(schema.conversations.participantB, ctx.user.id)
          )
        ),
      });

      if (existingConversation) {
        await db
          .update(schema.conversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(schema.conversations.id, existingConversation.id));
      } else {
        await db.insert(schema.conversations).values({
          participantA: ctx.user.id,
          participantB: input.recipientId,
          lastMessageAt: new Date(),
        });
      }

      return db.query.messages.findFirst({
        where: eq(schema.messages.id, message.id),
        with: { sender: true },
      });
    }),

  getConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const convs = await db.query.conversations.findMany({
      where: or(
        eq(schema.conversations.participantA, ctx.user.id),
        eq(schema.conversations.participantB, ctx.user.id)
      ),
      orderBy: [desc(schema.conversations.lastMessageAt)],
    });

    const result = [];
    for (const conv of convs) {
      const otherId =
        conv.participantA === ctx.user.id
          ? conv.participantB
          : conv.participantA;
      const otherUser = await db.query.users.findFirst({
        where: eq(schema.users.id, otherId),
      });
      const lastMessage = await db.query.messages.findFirst({
        where: or(
          and(
            eq(schema.messages.senderId, conv.participantA),
            eq(schema.messages.recipientId, conv.participantB)
          ),
          and(
            eq(schema.messages.senderId, conv.participantB),
            eq(schema.messages.recipientId, conv.participantA)
          )
        ),
        orderBy: [desc(schema.messages.createdAt)],
      });
      const unreadCount = await db
        .select()
        .from(schema.messages)
        .where(
          and(
            eq(schema.messages.senderId, otherId),
            eq(schema.messages.recipientId, ctx.user.id),
            eq(schema.messages.isRead, false)
          )
        );

      result.push({
        id: conv.id,
        otherUser,
        lastMessage,
        unreadCount: unreadCount.length,
      });
    }
    return result;
  }),

  getThread: authedQuery
    .input(
      z.object({
        userId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db.query.messages.findMany({
        where: and(
          or(
            and(
              eq(schema.messages.senderId, ctx.user.id),
              eq(schema.messages.recipientId, input.userId)
            ),
            and(
              eq(schema.messages.senderId, input.userId),
              eq(schema.messages.recipientId, ctx.user.id)
            )
          ),
          input.cursor ? and(eq(schema.messages.id, input.cursor)) : undefined
        ),
        with: { sender: true },
        orderBy: [desc(schema.messages.createdAt)],
        limit: input.limit + 1,
      });

      const hasMore = rows.length > input.limit;
      const messages = hasMore ? rows.slice(0, input.limit) : rows;
      return {
        messages,
        nextCursor: hasMore ? messages[messages.length - 1]?.id : null,
      };
    }),

  markRead: authedQuery
    .input(z.object({ senderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(schema.messages)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.messages.senderId, input.senderId),
            eq(schema.messages.recipientId, ctx.user.id),
            eq(schema.messages.isRead, false)
          )
        );
      return { success: true };
    }),
});
