import { z } from "zod";
import { eq, and, desc, count } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const notificationRouter = createRouter({
  getAll: authedQuery
    .input(
      z.object({
        limit: z.number().default(20),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db.query.notifications.findMany({
        where: and(
          eq(schema.notifications.userId, ctx.user.id),
          input.cursor ? and(eq(schema.notifications.id, input.cursor)) : undefined
        ),
        with: { actor: true, post: { with: { author: true } } },
        orderBy: [desc(schema.notifications.createdAt)],
        limit: input.limit + 1,
      });

      const unreadCountResult = await db
        .select({ count: count() })
        .from(schema.notifications)
        .where(
          and(
            eq(schema.notifications.userId, ctx.user.id),
            eq(schema.notifications.isRead, false)
          )
        );

      const hasMore = rows.length > input.limit;
      const notifications = hasMore ? rows.slice(0, input.limit) : rows;

      return {
        notifications,
        nextCursor: hasMore ? notifications[notifications.length - 1]?.id : null,
        unreadCount: unreadCountResult[0]?.count ?? 0,
      };
    }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.notifications.id, input.id),
            eq(schema.notifications.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.userId, ctx.user.id));
    return { success: true };
  }),

  getUnreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [result] = await db
      .select({ count: count() })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, ctx.user.id),
          eq(schema.notifications.isRead, false)
        )
      );
    return { count: result?.count ?? 0 };
  }),
});
