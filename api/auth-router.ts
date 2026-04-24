import { z } from "zod";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        displayName: z.string().max(255).optional(),
        bio: z.string().max(500).optional(),
        location: z.string().max(100).optional(),
        website: z.string().max(255).optional(),
        bannerUrl: z.string().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(schema.users)
        .set({
          displayName: input.displayName ?? undefined,
          bio: input.bio ?? undefined,
          location: input.location ?? undefined,
          website: input.website ?? undefined,
          bannerUrl: input.bannerUrl ?? undefined,
          avatar: input.avatar ?? undefined,
        })
        .where(eq(schema.users.id, ctx.user.id));

      return db.query.users.findFirst({
        where: eq(schema.users.id, ctx.user.id),
      });
    }),

  getUserByUsername: publicQuery
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.users.findFirst({
        where: eq(schema.users.unionId, input.username),
      });
    }),
});
