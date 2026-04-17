import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ashwini HMS — Doctor Dashboard",
  description: "Doctor-facing clinical workspace for Ashwini Hospital Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background-light dark:bg-dark-bg antialiased">
        {children}
      </body>
    </html>
  );
}
