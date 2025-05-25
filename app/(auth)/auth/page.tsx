"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerUser } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Staff" | "Admin">("Staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await login(username, password);
        console.log("Login response:", response);
        router.push("/dashboard");
      } else {
        const regResponse = await registerUser({
          name,
          email,
          username,
          password,
          role,
        });
        console.log("Register response:", regResponse);
        await login(username, password);
        router.push("/dashboard");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value: string) => {
    if (value === "Staff" || value === "Admin") {
      setRole(value);
    }
  };

  useEffect(() => {
    import("@/lib/db").then(({ initDB }) => initDB(true)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Side: Image with Gradient Overlay */}
        <div className="md:w-1/2 relative hidden md:block">
          <Image
            src="/img-login.svg"
            alt="Doctor registering a patient"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-700/70 to-cyan-700/30" />
        </div>
        {/* Right Side: Form with Gradient Background */}
        <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 tracking-tight">
              {isLogin ? "Login to CareQuery" : "Sign Up for CareQuery"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={!isLogin}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
              {!isLogin && (
                <div>
                  <Label htmlFor="role" className="text-gray-700 font-medium">Role</Label>
                  <Select value={role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                disabled={loading}
              >
                {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-5 w-full text-sm text-blue-600 cursor-pointer font-medium hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              {isLogin
                ? "Need an account? Sign Up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}