import { z } from "zod";
import { eq, desc, and, sql, lt, inArray } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const postRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        content: z.string().min(1).max(280),
        imageUrl: z.string().optional(),
        replyToId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [post] = await db
        .insert(schema.posts)
        .values({
          userId: ctx.user.id,
          content: input.content,
          imageUrl: input.imageUrl || null,
          replyToId: input.replyToId || null,
        })
        .$returningId();

      return db.query.posts.findFirst({
        where: eq(schema.posts.id, post.id),
        with: { author: true },
      });
    }),

  getFeed: publicQuery
    .input(
      z.object({
        type: z.enum(["for-you", "following"]).default("for-you"),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const limit = input.limit;

      if (input.type === "following" && ctx.user) {
        const followingSubquery = db
          .select({ followingId: schema.follows.followingId })
          .from(schema.follows)
          .where(eq(schema.follows.followerId, ctx.user.id));

        const rows = await db.query.posts.findMany({
          where: and(
            inArray(
              schema.posts.userId,
              sql`(${followingSubquery})`
            ),
            input.cursor ? lt(schema.posts.id, input.cursor) : undefined
          ),
          with: { author: true },
          orderBy: [desc(schema.posts.createdAt)],
          limit: limit + 1,
        });

        const hasMore = rows.length > limit;
        const posts = hasMore ? rows.slice(0, limit) : rows;
        return {
          posts,
          nextCursor: hasMore ? posts[posts.length - 1].id : null,
        };
      }

      const rows = await db.query.posts.findMany({
        where: input.cursor ? lt(schema.posts.id, input.cursor) : undefined,
        with: { author: true },
        orderBy: [desc(schema.posts.createdAt)],
        limit: limit + 1,
      });

      const hasMore = rows.length > limit;
      const posts = hasMore ? rows.slice(0, limit) : rows;
      return {
        posts,
        nextCursor: hasMore ? posts[posts.length - 1].id : null,
      };
    }),

  getByUser: publicQuery
    .input(
      z.object({
        userId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input.limit;

      const rows = await db.query.posts.findMany({
        where: and(
          eq(schema.posts.userId, input.userId),
          input.cursor ? lt(schema.posts.id, input.cursor) : undefined
        ),
        with: { author: true },
        orderBy: [desc(schema.posts.createdAt)],
        limit: limit + 1,
      });

      const hasMore = rows.length > limit;
      const posts = hasMore ? rows.slice(0, limit) : rows;
      return {
        posts,
        nextCursor: hasMore ? posts[posts.length - 1]?.id : null,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.posts.findFirst({
        where: eq(schema.posts.id, input.id),
        with: { author: true },
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const post = await db.query.posts.findFirst({
        where: eq(schema.posts.id, input.id),
      });
      if (!post || post.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.delete(schema.posts).where(eq(schema.posts.id, input.id));
      return { success: true };
    }),
});
