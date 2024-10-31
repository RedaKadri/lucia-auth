"use server";

import { ZodError, z } from "zod";
import { LoginSchema } from "@/types";

import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { createSession, generateSessionToken } from "@/lib/auth/session";
import { setSessionTokenCookie } from "@/lib/auth/cookies";

import { Throttler } from "@/lib/rate-limiting/throttling";

const throttler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300]);

export async function loginAction(
  values: z.infer<typeof LoginSchema>,
): Promise<{
  status: "error" | "success";
  message: string;
}> {
  try {
    LoginSchema.parse(values);
  } catch (error) {
    if (error instanceof ZodError) {
      const message =
        error.issues[0]?.message ?? "An unknown validation error occurred";
      return {
        status: "error",
        message,
      };
    }
  }

  const [result] = await db
    .select({ user: users })
    .from(users)
    .where(eq(users.name, values.username));
  if (!result || !result.user.password) {
    return {
      status: "error",
      message: "Incorrect username or password",
    };
  }

  if (!throttler.consume(result.user.id)) {
    return {
      status: "error",
      message: "Too many login attempts. Please try again later",
    };
  }

  const isValidPassword = await Bun.password.verify(
    values.password,
    result.user.password,
  );
  if (!isValidPassword) {
    return {
      status: "error",
      message: "Incorrect username or password",
    };
  }

  throttler.reset(result.user.id);

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, result.user.id);
  await setSessionTokenCookie(sessionToken, session.expiresAt);

  return {
    status: "success",
    message: "Logged in successfully",
  };
}
