"use server";

import { getCurrentSession } from "@/lib/auth";

import { z, ZodError } from "zod";
import { EmailVerificationSchema } from "@/types";

import {
  createEmailVerificationRequest,
  deleteEmailVerificationRequestCookie,
  deleteUserEmailVerificationRequest,
  getUserEmailVerificationRequestFromRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
} from "@/lib/email-verification";

import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function EmailVerificationAction(
  values: z.infer<typeof EmailVerificationSchema>,
): Promise<{
  status: "error" | "success";
  message: string;
}> {
  try {
    EmailVerificationSchema.parse(values);
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

  const { session } = await getCurrentSession();
  if (!session) {
    return {
      status: "error",
      message: "Not authenticated",
    };
  }

  const verificAtionRequest =
    await getUserEmailVerificationRequestFromRequest();
  if (!verificAtionRequest) {
    return {
      status: "error",
      message: "Not authenticated",
    };
  }

  if (verificAtionRequest.code !== values.code) {
    return {
      status: "error",
      message: "Incorrect code",
    };
  }

  await deleteUserEmailVerificationRequest(verificAtionRequest.userId);
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, verificAtionRequest.userId));
  await deleteEmailVerificationRequestCookie();

  return {
    status: "success",
    message: "Logged in successfully",
  };
}

export async function ResendEmailVerificationAction(): Promise<{
  status: "error" | "success";
  message: string;
}> {
  const { session, user } = await getCurrentSession();
  if (session === null) {
    return {
      status: "error",
      message: "Not authenticated",
    };
  }

  let verificAtionRequest = await getUserEmailVerificationRequestFromRequest();
  if (!verificAtionRequest) {
    return {
      status: "error",
      message: "Not authenticated",
    };
  }

  verificAtionRequest = await createEmailVerificationRequest(
    user.id,
    user.email,
  );
  sendVerificationEmail(verificAtionRequest.email, verificAtionRequest.code);
  await setEmailVerificationRequestCookie(verificAtionRequest);

  return {
    status: "success",
    message: "A new code was sent to your inbox",
  };
}
