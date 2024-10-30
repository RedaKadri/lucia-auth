import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await getCurrentSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex h-[80vh] items-center justify-center">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Welcome {user?.name}
      </h1>
    </main>
  );
}
