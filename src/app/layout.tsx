import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Ashwini HMS — Doctor Dashboard",
  description: "Doctor-facing clinical workspace for Ashwini Hospital Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background-light dark:bg-dark-bg antialiased flex" suppressHydrationWarning>
        <AuthGuard>
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {children}
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
