"use server";

import { ZodError, z } from "zod";
import { RegisterSchema } from "@/types";

import { createId } from "@paralleldrive/cuid2";

import db from "@/db";
import { users } from "@/db/schema";

import { createSession, generateSessionToken } from "@/lib/auth/session";
import { setSessionTokenCookie } from "@/lib/auth/cookies";

export async function registerAction(
  values: z.infer<typeof RegisterSchema>,
): Promise<{
  status: "error" | "success";
  message: string;
}> {
  try {
    RegisterSchema.parse(values);
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

  const userId = createId();
  const hashPassword = await Bun.password.hash(values.password);

  try {
    await db.insert(users).values({
      id: userId,
      name: values.username,
      password: hashPassword,
    });

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message ?? "An unknown error occurred";

      return {
        status: "error",
        message: errorMessage,
      };
    }
  }

  return {
    status: "success",
    message: "Your account has been created successfully",
  };
}
