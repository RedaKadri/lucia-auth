import { cookies } from "next/headers";

import { generateSessionToken, createSession } from "@/lib/auth/session";
import { setSessionTokenCookie } from "@/lib/auth/cookies";
import { github } from "@/lib/auth/oauth";

import { OAuth2RequestError, type OAuth2Tokens } from "arctic";
import { GitHubType } from "@/types";

import db from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

import { createId } from "@paralleldrive/cuid2";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value ?? null;
  if (code === null || state === null || storedState === null) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await github.validateAuthorizationCode(code);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }

  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });
  const githubUser: GitHubType = await githubUserResponse.json();

  const [existingUser] = await db
    .select({ id: users.id, name: users.name, oauth: users.oauth })
    .from(users)
    .where(sql`json_extract(oauth, '$.id') = ${githubUser.id}`);
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
    name: githubUser.login,
    password: null,
    oauth: {
      provider: "github",
      id: githubUser.id,
      email: githubUser.email ?? null,
      avatar_url: githubUser.avatar_url,
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
