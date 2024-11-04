import db from "@/db";
import { emailsVerification, type EmailVerification } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateRandomOTP } from "./utils";
import { encodeBase32 } from "@oslojs/encoding";
import { cookies } from "next/headers";
import { getCurrentSession } from "./auth";

export async function createEmailVerificationRequest(
  userId: string,
  email: string | null,
): Promise<EmailVerification> {
  await deleteUserEmailVerificationRequest(userId);

  const idBytes = new Uint8Array(20);
  crypto.getRandomValues(idBytes);

  const request = {
    id: encodeBase32(idBytes).toLowerCase(),
    userId,
    code: generateRandomOTP(),
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
  };
  await db.insert(emailsVerification).values(request);

  return request;
}

export async function deleteUserEmailVerificationRequest(userId: string) {
  await db
    .delete(emailsVerification)
    .where(eq(emailsVerification.userId, userId));
}

export function sendVerificationEmail(
  email: string | null,
  code: string | null,
) {
  console.log(`To ${email}: Your verification code is ${code}`);
}

export async function setEmailVerificationRequestCookie(
  request: EmailVerification,
) {
  const tokenCookie = await cookies();
  tokenCookie.set("email_verification", request.id, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: request.expiresAt,
  });
}

export async function deleteEmailVerificationRequestCookie() {
  const tokenCookie = await cookies();
  tokenCookie.set("email_verification", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

export async function getUserEmailVerificationRequest(
  userId: string,
  id: string,
): Promise<EmailVerification | null> {
  const [result] = await db
    .select()
    .from(emailsVerification)
    .where(
      and(eq(emailsVerification.id, id), eq(emailsVerification.userId, userId)),
    );
  if (!result) return null;

  return result;
}

export async function getUserEmailVerificationRequestFromRequest(): Promise<EmailVerification | null> {
  const { user } = await getCurrentSession();
  if (!user) return null;

  const cookiesStore = await cookies();
  const id = cookiesStore.get("email_verification")?.value ?? null;
  if (!id) return null;

  const request = await getUserEmailVerificationRequest(user.id, id);
  if (request === null) {
    deleteEmailVerificationRequestCookie();
  }
  return request;
}
