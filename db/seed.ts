import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(schema.interactions);
  await db.delete(schema.notifications);
  await db.delete(schema.messages);
  await db.delete(schema.conversations);
  await db.delete(schema.follows);
  await db.delete(schema.posts);
  await db.delete(schema.trends);

  // Insert trends
  await db.insert(schema.trends).values([
    { category: "Technology", topic: "AI Revolution", postCount: 124000 },
    { category: "Politics", topic: "Global Summit 2026", postCount: 89000 },
    { category: "Sports", topic: "Champions League", postCount: 67000 },
    { category: "Entertainment", topic: "Neon Genesis", postCount: 54000 },
    { category: "Science", topic: "Mars Colony", postCount: 43000 },
    { category: "Business", topic: "Crypto Markets", postCount: 38000 },
    { category: "Culture", topic: "Digital Art Week", postCount: 29000 },
    { category: "Health", topic: "Biohacking", postCount: 21000 },
  ]);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
