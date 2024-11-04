import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Home() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  if (!user.emailVerified) redirect("/email-verification");

  return (
    <main className="flex h-[80vh] items-center justify-center gap-3">
      <Avatar>
        <AvatarImage src={user.oauth?.avatar_url || undefined} alt="@shadcn" />
        <AvatarFallback>{user.name}</AvatarFallback>
      </Avatar>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {user?.name}
      </h3>
    </main>
  );
}
