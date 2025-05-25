"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-white py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-700 mb-6 tracking-tight">
            CareQuery: Empowering Patient Care
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Seamlessly register patients, schedule appointments, and manage data securely—all from your browser with ease.
          </p>
          <Link href="/auth">
            <Button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg font-semibold py-6 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </main>
      <footer className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white py-6 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm">© 2025 CareQuery. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="/about" className="text-white/80 hover:text-white transition-colors duration-200">About</a>
            <a href="/contact" className="text-white/80 hover:text-white transition-colors duration-200">Contact</a>
            <a href="/privacy" className="text-white/80 hover:text-white transition-colors duration-200">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}