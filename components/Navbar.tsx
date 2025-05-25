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
    <nav className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white py-4 sticky top-0 z-20 shadow-lg">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="CareQuery Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <Link href="/">
            <span className="text-xl font-semibold tracking-tight hover:text-cyan-100 transition-colors duration-200">
              CareQuery
            </span>
          </Link>
        </div>
        {showSignup && (
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button
                variant="outline"
                className="text-blue-700 hover:bg-gray-100 border-white hover:bg-cyan-600 hover:border-cyan-600 hover:text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 ease-in-out"
              >
                {user ? user.username : "Sign Up"}
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                className="bg-white text-blue-700 hover:bg-gray-100 hover:text-blue-800 font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}