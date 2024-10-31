import type { InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  password: text("password"),
  oauth: text("oauth", { mode: "json" }).$type<OAuth>(),
});

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: int("expires_at", {
    mode: "timestamp",
  }).notNull(),
});

type OAuth = {
  provider: "google" | "github";
  id: string | number;
  email: string | null;
  avatar_url: string | null;
};

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
