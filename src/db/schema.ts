import type { InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().unique(),
  password: text(),
  emailVerified: int("email_verified", { mode: "boolean" }).default(false),
  oauth: text({ mode: "json" }).$type<OAuth>(),
});

export const emailsVerification = sqliteTable("emails_verification", {
  id: text().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  code: text(),
  email: text(),
  expiresAt: int("expires_at", {
    mode: "timestamp",
  }).notNull(),
});

export const sessions = sqliteTable("session", {
  id: text().primaryKey(),
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
export type EmailVerification = InferSelectModel<typeof emailsVerification>;
