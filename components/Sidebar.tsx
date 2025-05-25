"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import {
  Calendar,
  Database,
  LayoutDashboard,
  LogOut,
  User2Icon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col justify-between">
      <div>
        <Link href={"/"}>
          <Image
            src="/logo.png"
            alt="CareQuery Logo"
            width={128}
            height={128}
          />
        </Link>{" "}
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start text-white hover:bg-white/70"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start text-white hover:bg-white/70"
            onClick={() => router.push("/dashboard?tab=create-patient")}
          >
            <User2Icon className="mr-2 h-4 w-4" />
            Create Patient
          </Button>
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start text-white hover:bg-white/70"
            onClick={() => router.push("/dashboard?tab=book-appointment")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start text-white hover:bg-white/70"
            onClick={() => router.push("/dashboard?tab=patients")}
          >
            <Users className="mr-2 h-4 w-4" />
            Patients
          </Button>
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start text-white hover:bg-white/70"
            onClick={() => router.push("/sql")}
          >
            <Database className="mr-2 h-4 w-4" />
            Raw SQL
          </Button>
        </nav>
      </div>
      <Button
        variant="ghost"
        className="w-full cursor-pointer font-bold text-[1rem] hover:text-white/90 justify-start bg-amber-700 text-white hover:bg-amber-800"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
