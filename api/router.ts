import { authRouter } from "./auth-router";
import { postRouter } from "./post-router";
import { interactionRouter } from "./interaction-router";
import { followRouter } from "./follow-router";
import { notificationRouter } from "./notification-router";
import { messageRouter } from "./message-router";
import { searchRouter } from "./search-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  post: postRouter,
  interaction: interactionRouter,
  follow: followRouter,
  notification: notificationRouter,
  message: messageRouter,
  search: searchRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
