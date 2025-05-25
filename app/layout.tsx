import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "CareQuery",
  description: "Patient registration and appointment management app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="flex bg-gradient-to-b from-blue-100 to-gray-100">
            <main className="flex-1 ">
              <AuthGuard>{children}</AuthGuard>
            </main>
          </div>
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
