"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    setShowSidebar(!["/", "/auth"].includes(pathname));
  }, [pathname]);

  return (
    <Suspense>
      <main className="h-screen overflow-hidden">
        <div className="flex h-full w-full">
          {showSidebar && (
            <div className="fixed top-0 left-0 w-64 h-screen">
              <Sidebar />
            </div>
          )}
          <main
            className={`flex-1 h-screen overflow-auto ${
              showSidebar ? "ml-64" : ""
            }`}
          >
            {children}
          </main>
        </div>
      </main>
    </Suspense>
  );
}
