"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const showSignup = ["/"].includes(pathname);

  return (
    <nav className="bg-blue-600 text-white p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href={"/"}>
            <Image
              src="/logo.png"
              alt="CareQuery Logo"
              width={128}
              height={128}
            />
          </Link>
        </div>
        {showSignup && (
          <div className="space-x-4">
            <Link href="/auth">
              <Button className="text-white cursor-pointer border-white hover:bg-blue-700">
                {user ? user?.username : "Sign-up"}
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-white cursor-pointer text-blue-600 hover:bg-gray-200">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
