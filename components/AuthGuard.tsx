"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && window.location.pathname.startsWith("/dashboard")) {
      router.push("/auth");
    }
    if (user && window.location.pathname === "/auth") {
      router.push("/dashboard");
    }
  }, [user, router]);

  return <>{children}</>;
}
