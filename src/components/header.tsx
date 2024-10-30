"use client";

import Link from "next/link";

import { logOutAction } from "@/app/action";

import { Button } from "./ui/button";

import { ModeToggle } from "./theme/theme-toggle";
import { toast } from "sonner";

import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

function Header() {
  const onSubmit = async () => {
    const res = await logOutAction();

    if (res.status === "success") {
      redirect("/login");
    }
    if (res.status === "error") {
      toast("Error", {
        description: res.message,
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link href={"/"} className="cursor-pointer">
        <Button variant="ghost" className="font-mono text-2xl font-bold">
          Lucia Auth
        </Button>
      </Link>
      <div className="flex justify-center gap-4">
        <form action={onSubmit}>
          <Button variant="ghost" size={"icon"} type="submit">
            <LogOut />
          </Button>
        </form>
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
