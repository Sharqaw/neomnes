import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const followRouter = createRouter({
  toggle: authedQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (input.userId === ctx.user.id) {
        throw new Error("Cannot follow yourself");
      }

      const existing = await db.query.follows.findFirst({
        where: and(
          eq(schema.follows.followerId, ctx.user.id),
          eq(schema.follows.followingId, input.userId)
        ),
      });

      if (existing) {
        await db.delete(schema.follows).where(eq(schema.follows.id, existing.id));
        return { following: false };
      }

      await db.insert(schema.follows).values({
        followerId: ctx.user.id,
        followingId: input.userId,
      });

      await db.insert(schema.notifications).values({
        userId: input.userId,
        actorId: ctx.user.id,
        type: "follow",
      });

      return { following: true };
    }),

  getFollowers: publicQuery
    .input(z.object({ userId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.query.follows.findMany({
        where: eq(schema.follows.followingId, input.userId),
        with: { follower: true },
        limit: input.limit,
      });
      return rows.map((r) => r.follower);
    }),

  getFollowing: publicQuery
    .input(z.object({ userId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.query.follows.findMany({
        where: eq(schema.follows.followerId, input.userId),
        with: { following: true },
        limit: input.limit,
      });
      return rows.map((r) => r.following);
    }),

  isFollowing: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return { following: false };
      const db = getDb();
      const existing = await db.query.follows.findFirst({
        where: and(
          eq(schema.follows.followerId, ctx.user.id),
          eq(schema.follows.followingId, input.userId)
        ),
      });
      return { following: !!existing };
    }),

  getSuggestions: authedQuery
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const followingRows = await db
        .select({ followingId: schema.follows.followingId })
        .from(schema.follows)
        .where(eq(schema.follows.followerId, ctx.user.id));
      const followingIds = followingRows.map((r) => r.followingId);

      const allUsers = await db.query.users.findMany({
        where: (users, { notInArray }) =>
          notInArray(users.id, [...followingIds, ctx.user.id]),
        limit: input.limit,
      });

      return allUsers;
    }),

  getCounts: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [followers] = await db
        .select({ count: count() })
        .from(schema.follows)
        .where(eq(schema.follows.followingId, input.userId));
      const [following] = await db
        .select({ count: count() })
        .from(schema.follows)
        .where(eq(schema.follows.followerId, input.userId));
      return {
        followers: followers?.count ?? 0,
        following: following?.count ?? 0,
      };
    }),
});
