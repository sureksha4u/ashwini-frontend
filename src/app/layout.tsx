import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Ashwini HMS",
  description: "Premium Hospital Management System for India",
};

// Inline script to apply the saved theme class before React mounts —
// avoids a flash of unstyled (light) content on dark-mode users.
const themeBootstrap = `
(function () {
  try {
    var saved = localStorage.getItem('ashwini_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t = saved || (prefersDark ? 'dark' : 'light');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen bg-page text-text-primary antialiased flex" suppressHydrationWarning>
        <ThemeProvider>
          <AuthGuard>
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              {children}
            </div>
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
