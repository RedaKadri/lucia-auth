import { cache } from "react";
import { cookies } from "next/headers";

import { type SessionValidationResult, validateSessionToken } from "./session";

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return { session: null, user: null };
    }

    const result = await validateSessionToken(token);

    return result;
  },
);
