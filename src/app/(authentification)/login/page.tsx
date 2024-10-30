import { getCurrentSession } from "@/lib/auth";

import LoginForm from "./_components/login-form";

import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { user } = await getCurrentSession();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex h-[85vh] w-full items-center justify-center">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-4xl font-bold">Login</h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
