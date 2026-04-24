import { relations } from "drizzle-orm";
import { users, posts, interactions, follows, notifications, messages } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  interactions: many(interactions),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  notifications: many(notifications),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.userId], references: [users.id] }),
  interactions: many(interactions),
  replies: many(posts, { relationName: "reply" }),
  replyTo: one(posts, { fields: [posts.replyToId], references: [posts.id], relationName: "reply" }),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  user: one(users, { fields: [interactions.userId], references: [users.id] }),
  post: one(posts, { fields: [interactions.postId], references: [posts.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "following" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  actor: one(users, { fields: [notifications.actorId], references: [users.id] }),
  post: one(posts, { fields: [notifications.postId], references: [posts.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  recipient: one(users, { fields: [messages.recipientId], references: [users.id], relationName: "recipient" }),
}));
