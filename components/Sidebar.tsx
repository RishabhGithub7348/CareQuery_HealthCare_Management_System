"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext"; // Assuming this path is correct
import {
  Calendar,
  Database,
  LayoutDashboard,
  LogOut,
  UserPlus2, // Changed from User2Icon for "Create Patient" for clarity
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation"; // Added usePathname and useSearchParams

// Define navigation items for better organization
const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    isTab: false,
  },
  {
    href: "/dashboard?tab=create-patient",
    label: "Create Patient",
    icon: UserPlus2, // Using a more specific icon
    isTab: true,
    tabName: "create-patient",
  },
  {
    href: "/dashboard?tab=book-appointment",
    label: "Book Appointment",
    icon: Calendar,
    isTab: true,
    tabName: "book-appointment",
  },
  {
    href: "/dashboard?tab=patients",
    label: "Patients",
    icon: Users,
    isTab: true,
    tabName: "patients",
  },
  {
    href: "/sql",
    label: "Raw SQL Query", // Slightly more descriptive
    icon: Database,
    isTab: false,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // Make sure logout completes if it's async
    router.push("/auth");
    router.refresh(); // Good practice to refresh router state after logout/auth changes
  };

  const isActive = (itemHref: string, itemIsTab?: boolean, itemTabName?: string) => {
    const currentTab = searchParams.get("tab");

    // For non-tabbed main links (e.g., /dashboard, /sql)
    if (!itemIsTab) {
      return pathname === itemHref && !currentTab; // Active if path matches and no tab is active
    }

    // For tabbed links (e.g., /dashboard?tab=patients)
    // Ensure we are on the base path of the tabbed link (e.g., /dashboard)
    // And the current tab in the URL matches the item's tabName
    const basePath = itemHref.split("?")[0];
    return pathname === basePath && currentTab === itemTabName;
  };


  return (
    <div className="w-64 bg-slate-900 text-slate-100 h-screen p-4 flex flex-col justify-between shadow-lg">
      <div>
        <Link href="/" className="mb-8 block px-2 group">
          <Image
            src="/logo.png" // Make sure this path is correct in your public folder
            alt="CareQuery Logo"
            width={140} // Slightly larger for better visibility
            height={140}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild // Important: Allows Link to be the actual navigable element
              className={`w-full justify-start px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 ease-in-out
                ${
                  isActive(item.href, item.isTab, item.tabName)
                    ? "bg-sky-600 text-white shadow-sm" // Active state: Brighter, distinct
                    : "text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:bg-slate-700 focus-visible:text-white" // Default and hover
                }`}
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>

      <Button
        variant="ghost"
        className="w-full cursor-pointer font-semibold text-[0.95rem] hover:text-white justify-start bg-amber-600 text-white hover:bg-amber-700 focus-visible:bg-amber-700 p-3 rounded-md transition-colors duration-150 ease-in-out mt-4"
        onClick={handleLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Logout
      </Button>
    </div>
  );
}