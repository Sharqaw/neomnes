import { z } from "zod";
import { eq, and, count, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const interactionRouter = createRouter({
  toggleLike: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.interactions.findFirst({
        where: and(
          eq(schema.interactions.userId, ctx.user.id),
          eq(schema.interactions.postId, input.postId),
          eq(schema.interactions.type, "like")
        ),
      });

      if (existing) {
        await db
          .delete(schema.interactions)
          .where(eq(schema.interactions.id, existing.id));
        return { liked: false };
      }

      await db.insert(schema.interactions).values({
        userId: ctx.user.id,
        postId: input.postId,
        type: "like",
      });

      const post = await db.query.posts.findFirst({
        where: eq(schema.posts.id, input.postId),
      });
      if (post && post.userId !== ctx.user.id) {
        await db.insert(schema.notifications).values({
          userId: post.userId,
          actorId: ctx.user.id,
          postId: input.postId,
          type: "like",
        });
      }

      return { liked: true };
    }),

  toggleBookmark: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.interactions.findFirst({
        where: and(
          eq(schema.interactions.userId, ctx.user.id),
          eq(schema.interactions.postId, input.postId),
          eq(schema.interactions.type, "bookmark")
        ),
      });

      if (existing) {
        await db
          .delete(schema.interactions)
          .where(eq(schema.interactions.id, existing.id));
        return { bookmarked: false };
      }

      await db.insert(schema.interactions).values({
        userId: ctx.user.id,
        postId: input.postId,
        type: "bookmark",
      });

      return { bookmarked: true };
    }),

  toggleRepost: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.interactions.findFirst({
        where: and(
          eq(schema.interactions.userId, ctx.user.id),
          eq(schema.interactions.postId, input.postId),
          eq(schema.interactions.type, "repost")
        ),
      });

      if (existing) {
        await db
          .delete(schema.interactions)
          .where(eq(schema.interactions.id, existing.id));
        return { reposted: false };
      }

      await db.insert(schema.interactions).values({
        userId: ctx.user.id,
        postId: input.postId,
        type: "repost",
      });

      const post = await db.query.posts.findFirst({
        where: eq(schema.posts.id, input.postId),
      });
      if (post && post.userId !== ctx.user.id) {
        await db.insert(schema.notifications).values({
          userId: post.userId,
          actorId: ctx.user.id,
          postId: input.postId,
          type: "repost",
        });
      }

      return { reposted: true };
    }),

  getCounts: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [likes] = await db
        .select({ count: count() })
        .from(schema.interactions)
        .where(
          and(
            eq(schema.interactions.postId, input.postId),
            eq(schema.interactions.type, "like")
          )
        );
      const [reposts] = await db
        .select({ count: count() })
        .from(schema.interactions)
        .where(
          and(
            eq(schema.interactions.postId, input.postId),
            eq(schema.interactions.type, "repost")
          )
        );
      const [bookmarks] = await db
        .select({ count: count() })
        .from(schema.interactions)
        .where(
          and(
            eq(schema.interactions.postId, input.postId),
            eq(schema.interactions.type, "bookmark")
          )
        );
      const [replies] = await db
        .select({ count: count() })
        .from(schema.posts)
        .where(eq(schema.posts.replyToId, input.postId));

      return {
        likes: likes?.count ?? 0,
        reposts: reposts?.count ?? 0,
        bookmarks: bookmarks?.count ?? 0,
        replies: replies?.count ?? 0,
      };
    }),

  getUserStates: authedQuery
    .input(z.object({ postIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (input.postIds.length === 0) return {};

      const placeholders = input.postIds.map(() => "?").join(",");
      const rows = await db.execute(
        sql`SELECT postId, type FROM interactions WHERE userId = ${ctx.user.id} AND postId IN (${sql.raw(placeholders)})`
      );

      const result: Record<string, { liked: boolean; bookmarked: boolean; reposted: boolean }> = {};
      for (const id of input.postIds) {
        result[id] = { liked: false, bookmarked: false, reposted: false };
      }
      for (const row of (rows as unknown as Array<{ postId: number; type: string }>)) {
        if (result[row.postId]) {
          if (row.type === "like") result[row.postId].liked = true;
          if (row.type === "bookmark") result[row.postId].bookmarked = true;
          if (row.type === "repost") result[row.postId].reposted = true;
        }
      }
      return result;
    }),
});