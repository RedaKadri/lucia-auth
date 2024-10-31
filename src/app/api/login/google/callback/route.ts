import { cookies } from "next/headers";

import { decodeIdToken, OAuth2RequestError, type OAuth2Tokens } from "arctic";
import { google } from "@/lib/auth/oauth";
import { GoogleType } from "@/types";

import { createSession, generateSessionToken } from "@/lib/auth/session";
import { setSessionTokenCookie } from "@/lib/auth/cookies";

import db from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

import { createId } from "@paralleldrive/cuid2";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return new Response("Please restart the process.", {
        status: 400,
      });
    }
    return new Response("Please restart the process.", {
      status: 500,
    });
  }

  const googleUser = decodeIdToken(tokens.idToken()) as GoogleType;

  const [existingUser] = await db
    .select({ id: users.id, name: users.name, oauth: users.oauth })
    .from(users)
    .where(sql`json_extract(oauth, '$.id') = ${googleUser.sub}`);
  if (existingUser && existingUser.oauth !== null) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const userId = createId();
  await db.insert(users).values({
    id: userId,
    name: googleUser.name,
    password: null,
    oauth: {
      provider: "google",
      id: googleUser.sub,
      email: googleUser.email,
      avatar_url: googleUser.picture ?? null,
    },
  });
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, userId);
  await setSessionTokenCookie(sessionToken, session.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}
