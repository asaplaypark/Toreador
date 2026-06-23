"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="border-sepia-pale/60 text-sepia-pale hover:bg-white/10 hover:border-sepia-pale hover:text-white"
    >
      ออกจากระบบ
    </Button>
  );
}
