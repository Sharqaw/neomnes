import { z } from "zod";
import { like, desc, or } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const searchRouter = createRouter({
  users: publicQuery
    .input(z.object({ query: z.string().min(1), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.users.findMany({
        where: or(
          like(schema.users.name, `%${input.query}%`),
          like(schema.users.unionId, `%${input.query}%`),
          like(schema.users.displayName, `%${input.query}%`)
        ),
        limit: input.limit,
      });
    }),

  posts: publicQuery
    .input(z.object({ query: z.string().min(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.posts.findMany({
        where: like(schema.posts.content, `%${input.query}%`),
        with: { author: true },
        orderBy: [desc(schema.posts.createdAt)],
        limit: input.limit,
      });
    }),

  trends: publicQuery
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.trends.findMany({
        orderBy: [desc(schema.trends.postCount)],
        limit: input.limit,
      });
    }),
});
