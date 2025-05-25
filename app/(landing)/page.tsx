"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-200 to-cyan-200">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
            CareQuery: Streamline Patient Care
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            Register patients, book appointments, and query data securely—all in
            your browser.
          </p>
          <Link href="/auth">
            <Button
              variant="ghost"
              className=" bg-gradient-to-r hover:text-white/90 cursor-pointer text-2xl text-white font-black p-8 from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Start Now
            </Button>
          </Link>
        </div>
      </main>
      <footer className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 text-center">
        <p>© 2025 CareQuery. All rights reserved.</p>
      </footer>
    </div>
  );
}
