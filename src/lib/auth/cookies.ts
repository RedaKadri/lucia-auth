import { cookies } from "next/headers";

export async function setSessionTokenCookie(token: string, expiresAt: Date) {
  const tokenCookie = await cookies();
  tokenCookie.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie() {
  const tokenCookie = await cookies();
  tokenCookie.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
