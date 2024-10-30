"use server";

import { getCurrentSession } from "@/lib/auth";
import { deleteSessionTokenCookie } from "@/lib/auth/cookies";
import { invalidateSession } from "@/lib/auth/session";

export async function logOutAction(): Promise<{
  status: "error" | "success";
  message: string;
}> {
  try {
    const { session } = await getCurrentSession();
    if (!session) {
      return {
        status: "error",
        message: "Not authenticated",
      };
    }

    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
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
    message: "Logged out successfully",
  };
}
