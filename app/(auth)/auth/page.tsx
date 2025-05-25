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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [role, setRole] = useState<any>("Staff");
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
        console.log("Login response:", response); // Debug log
        router.push("/dashboard");
      } else {
        const regResponse = await registerUser({
          name,
          email,
          username,
          password,
          role,
        });
        console.log("Register response:", regResponse); // Debug log
        await login(username, password);
        router.push("/dashboard");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Auth error:", err); // Debug log
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    import("@/lib/db").then(({ initDB }) => initDB(true)).catch(console.error);
  }, []);

  return (
    <div className=" flex flex-col overflow-hidden">
      <Navbar />
      <div className="-mt-2 h-screen overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image with Gradient Overlay */}
        <div className="md:w-1/2 relative">
          <Image
            src="/img-login.svg"
            alt="Doctor registering a patient"
            height={500}
            width={500}
            className="object-cover m-auto justify-center mt-[20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent" />
        </div>
        {/* Right Side: Form with Gradient Background */}
        <div className="md:w-1/2 -mt-5 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">
              {isLogin ? "Login to CareQuery" : "Sign Up for CareQuery"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={loading}
              >
                {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-4 text-sm text-blue-600 hover:underline"
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
