import { redirect } from "next/navigation";

import EmailVerificationForm from "./_components/email-verification-form";

import { getCurrentSession } from "@/lib/auth";
import { getUserEmailVerificationRequestFromRequest } from "@/lib/email-verification";

export default async function EmailVerificationPage() {
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect("/login");
  }

  const verificationRequest =
    await getUserEmailVerificationRequestFromRequest();
  if (!verificationRequest && user.emailVerified) {
    return redirect("/");
  }

  return (
    <main className="flex h-[85vh] w-full items-center justify-center">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[450px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-4xl font-bold">Verify your email address</h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              We sent an 8-character code to
              {` ${user.email}`}
            </p>
          </div>
          <div className="w-[80%] mx-auto">
            <EmailVerificationForm />
          </div>
        </div>
      </div>
    </main>
  );
}
