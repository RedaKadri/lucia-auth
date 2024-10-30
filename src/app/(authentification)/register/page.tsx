import { redirect } from "next/navigation";

import RegisterForm from "./_components/register-form";

import { getCurrentSession } from "@/lib/auth";

export default async function RegiterPage() {
  const { user } = await getCurrentSession();
  if (user) {
    redirect("/");
  }

  return (
    <main className="flex h-[85vh] w-full items-center justify-center">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Register</h1>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
